import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { supabase, isSupabaseConfigured } from './supabase';

export interface VitalLog {
  heart_rate: number;
  blood_pressure_sys: number;
  blood_pressure_dia: number;
  weight: number;
  timestamp: string;
}

export interface LifestyleLog {
  sleep_hours: number;
  water_ml: number;
  steps: number;
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenToday: boolean;
}

interface HealthContextType {
  vitals: VitalLog;
  lifestyle: LifestyleLog;
  medications: Medication[];
  updateVitals: (vitals: Partial<VitalLog>) => void;
  updateLifestyle: (lifestyle: Partial<LifestyleLog>) => void;
  toggleMedication: (id: string) => void;
  addMedication: (med: Omit<Medication, 'id' | 'takenToday'>) => void;
  removeMedication: (id: string) => void;
  healthScore: number;
}

const DEFAULT_VITALS: VitalLog = {
  heart_rate: 72,
  blood_pressure_sys: 120,
  blood_pressure_dia: 80,
  weight: 70,
  timestamp: new Date().toISOString(),
};

const DEFAULT_LIFESTYLE: LifestyleLog = {
  sleep_hours: 8,
  water_ml: 2000,
  steps: 8000,
  timestamp: new Date().toISOString(),
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const [vitals, setVitalsState] = useState<VitalLog>(DEFAULT_VITALS);
  const [lifestyle, setLifestyleState] = useState<LifestyleLog>(DEFAULT_LIFESTYLE);
  const [medications, setMedications] = useState<Medication[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (isSupabaseConfigured && !isGuest && user) {
        // Load from Supabase
        try {
          const { data: vitalsData } = await supabase
            .from('vitals')
            .select('*')
            .order('logged_at', { ascending: false })
            .limit(1);
          
          if (vitalsData?.[0]) {
            setVitalsState({
              heart_rate: vitalsData[0].heart_rate,
              blood_pressure_sys: vitalsData[0].systolic_bp,
              blood_pressure_dia: vitalsData[0].diastolic_bp,
              weight: vitalsData[0].weight_kg,
              timestamp: vitalsData[0].logged_at
            });
          }

          const { data: lifestyleData } = await supabase
            .from('lifestyle_logs')
            .select('*')
            .order('logged_at', { ascending: false })
            .limit(1);

          if (lifestyleData?.[0]) {
            setLifestyleState({
              sleep_hours: lifestyleData[0].sleep_hours,
              water_ml: lifestyleData[0].water_intake_ml,
              steps: lifestyleData[0].steps,
              timestamp: lifestyleData[0].logged_at
            });
          }

          const { data: medsData } = await supabase
            .from('medications')
            .select('*')
            .eq('active', true);

          if (medsData) {
            setMedications(medsData.map((m: any) => ({
              id: m.id,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              takenToday: false // Logic for takenToday would need medication_logs table joins
            })));
          }
        } catch (error) {
          console.error('Error loading data from Supabase:', error);
        }
      } else {
        // Load from Local Storage
        const savedVitals = localStorage.getItem('vitalis-vitals');
        const savedLifestyle = localStorage.getItem('vitalis-lifestyle');
        const savedMeds = localStorage.getItem('vitalis-meds');

        if (savedVitals) setVitalsState(JSON.parse(savedVitals));
        if (savedLifestyle) setLifestyleState(JSON.parse(savedLifestyle));
        if (savedMeds) setMedications(JSON.parse(savedMeds));
      }
    };

    loadData();
  }, [user, isGuest]);

  // Save to local storage (fallback/guest)
  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-vitals', JSON.stringify(vitals));
    }
  }, [vitals, isGuest]);

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-lifestyle', JSON.stringify(lifestyle));
    }
  }, [lifestyle, isGuest]);

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-meds', JSON.stringify(medications));
    }
  }, [medications, isGuest]);

  const updateVitals = async (newVitals: Partial<VitalLog>) => {
    const updated = { ...vitals, ...newVitals, timestamp: new Date().toISOString() };
    setVitalsState(updated);

    if (isSupabaseConfigured && !isGuest && user) {
      await supabase.from('vitals').insert({
        user_id: user.id,
        heart_rate: updated.heart_rate,
        systolic_bp: updated.blood_pressure_sys,
        diastolic_bp: updated.blood_pressure_dia,
        weight_kg: updated.weight,
        logged_at: updated.timestamp
      });
    }
  };

  const updateLifestyle = async (newLifestyle: Partial<LifestyleLog>) => {
    const updated = { ...lifestyle, ...newLifestyle, timestamp: new Date().toISOString() };
    setLifestyleState(updated);

    if (isSupabaseConfigured && !isGuest && user) {
      await supabase.from('lifestyle_logs').insert({
        user_id: user.id,
        sleep_hours: updated.sleep_hours,
        water_intake_ml: updated.water_ml,
        steps: updated.steps,
        logged_at: updated.timestamp
      });
    }
  };

  const toggleMedication = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m));
  };

  const addMedication = (med: Omit<Medication, 'id' | 'takenToday'>) => {
    const newMed: Medication = {
      ...med,
      id: Math.random().toString(36).substr(2, 9),
      takenToday: false,
    };
    setMedications(prev => [...prev, newMed]);
  };

  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const calculateHealthScore = () => {
    let score = 0;
    
    // Sleep (30%)
    if (lifestyle.sleep_hours >= 7 && lifestyle.sleep_hours <= 9) score += 30;
    else if (lifestyle.sleep_hours >= 6) score += 20;
    else if (lifestyle.sleep_hours > 0) score += 10;

    // Water (20%)
    if (lifestyle.water_ml >= 2000) score += 20;
    else if (lifestyle.water_ml >= 1000) score += 10;

    // Steps (30%)
    if (lifestyle.steps >= 10000) score += 30;
    else if (lifestyle.steps >= 7000) score += 20;
    else if (lifestyle.steps >= 3000) score += 10;

    // Vitals (20%)
    if (vitals.heart_rate >= 60 && vitals.heart_rate <= 100) score += 10;
    if (vitals.blood_pressure_sys >= 110 && vitals.blood_pressure_sys <= 130) score += 5;
    if (vitals.blood_pressure_dia >= 70 && vitals.blood_pressure_dia <= 90) score += 5;

    return Math.min(score, 100);
  };

  return (
    <HealthContext.Provider value={{ 
      vitals, 
      lifestyle, 
      medications, 
      updateVitals, 
      updateLifestyle, 
      toggleMedication,
      addMedication,
      removeMedication,
      healthScore: calculateHealthScore() 
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
