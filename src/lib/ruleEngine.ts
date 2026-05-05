import { supabase, HealthRule, VitalLog, LifestyleLog, Alert } from './supabase';

export class RuleEngine {
  static async evaluateVitals(vitals: Partial<VitalLog>, userId: string): Promise<Alert[]> {
    const { data: rules } = await supabase
      .from('health_rules')
      .select('*')
      .in('parameter', ['heart_rate', 'weight_kg']);

    if (!rules) return [];

    const generatedAlerts: Alert[] = [];

    if (vitals.heart_rate) {
      const hrRules = rules.filter(r => r.parameter === 'heart_rate');
      for (const rule of hrRules) {
        if (
          (rule.min_value && vitals.heart_rate < rule.min_value) ||
          (rule.max_value && vitals.heart_rate > rule.max_value)
        ) {
          generatedAlerts.push({
            title: `Heart Rate Alert`,
            message: rule.message,
            severity: rule.severity,
            created_at: new Date().toISOString()
          } as Alert);
        }
      }
    }

    // Save to DB if alerts found
    if (generatedAlerts.length > 0) {
      await supabase.from('alerts').insert(
        generatedAlerts.map(a => ({
          user_id: userId,
          title: a.title,
          message: a.message,
          severity: a.severity
        }))
      );
    }

    return generatedAlerts;
  }

  static calculateHealthScore(lifestyle: LifestyleLog, vitals: VitalLog): number {
    let score = 0;

    // Sleep (30%)
    if (lifestyle.sleep_hours >= 7 && lifestyle.sleep_hours <= 9) score += 30;
    else if (lifestyle.sleep_hours >= 6) score += 20;
    else if (lifestyle.sleep_hours > 0) score += 10;

    // Water (20%)
    if (lifestyle.water_intake_ml >= 2000) score += 20;
    else if (lifestyle.water_intake_ml >= 1000) score += 10;

    // Steps (30%)
    if (lifestyle.steps >= 10000) score += 30;
    else if (lifestyle.steps >= 7000) score += 20;
    else if (lifestyle.steps >= 3000) score += 10;

    // Vitals (20%) - simplified
    if (vitals.heart_rate >= 60 && vitals.heart_rate <= 100) score += 20;
    else if (vitals.heart_rate > 0) score += 10;

    return Math.min(score, 100);
  }
}
