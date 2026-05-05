import React from 'react';
import { Card } from '../components/UI';
import { ICONS } from '../constants';
import { cn } from '../lib/utils';
import { useHealth } from '../lib/store';

export default function Vitals() {
  const { vitals, updateVitals } = useHealth();

  const getBPStatus = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: 'Normal', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' };
    if (sys <= 129 && dia < 80) return { label: 'Elevated', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
    if (sys <= 139 || dia <= 89) return { label: 'Hypertension S1', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' };
    if (sys >= 180 || dia >= 120) return { label: 'Crisis', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-600/10' };
    return { label: 'Hypertension S2', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' };
  };

  const getHRStatus = (hr: number) => {
    if (hr < 60) return { label: 'Low', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
    if (hr <= 100) return { label: 'Normal', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-500/10' };
    return { label: 'High', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' };
  };

  const bpStatus = getBPStatus(vitals.blood_pressure_sys, vitals.blood_pressure_dia);
  const hrStatus = getHRStatus(vitals.heart_rate);

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Log New Vitals" subtitle="Keep your data up to date" className="lg:col-span-1">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Heart Rate (bpm)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={vitals.heart_rate || ''}
                onChange={(e) => updateVitals({ heart_rate: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Systolic</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  value={vitals.blood_pressure_sys || ''}
                  onChange={(e) => updateVitals({ blood_pressure_sys: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Diastolic</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  value={vitals.blood_pressure_dia || ''}
                  onChange={(e) => updateVitals({ blood_pressure_dia: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
              <input 
                type="number" step="0.1"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={vitals.weight || ''}
                onChange={(e) => updateVitals({ weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex flex-col items-center justify-center text-center p-8">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-colors", hrStatus.bg, hrStatus.color)}>
                <ICONS.Heart size={32} />
              </div>
              <p className="text-sm font-medium text-slate-500">Heart Rate Status</p>
              <h3 className={cn("text-3xl font-bold mt-1", hrStatus.color)}>{hrStatus.label}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2">{vitals.heart_rate} BPM</p>
            </Card>

            <Card className="flex flex-col items-center justify-center text-center p-8">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-colors", bpStatus.bg, bpStatus.color)}>
                <ICONS.Activity size={32} />
              </div>
              <p className="text-sm font-medium text-slate-500">Blood Pressure</p>
              <h3 className={cn("text-3xl font-bold mt-1", bpStatus.color)}>{bpStatus.label}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2">{vitals.blood_pressure_sys}/{vitals.blood_pressure_dia} mmHg</p>
            </Card>
          </div>

          <Card title="Vital Insights" icon="AlertTriangle">
            <div className="space-y-4">
               {vitals.blood_pressure_sys >= 130 && (
                 <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30 flex gap-3">
                   <ICONS.AlertTriangle className="text-orange-500 shrink-0" size={18} />
                   <p className="text-xs text-slate-600 dark:text-slate-400">Your blood pressure is in the <strong>Hypertension</strong> range. Consider reducing sodium intake and consulting a doctor.</p>
                 </div>
               )}
               {vitals.heart_rate > 100 && (
                 <div className="p-4 rounded-xl bg-red-50 dark:bg-critical-500/10 border border-red-100 dark:border-red-900/30 flex gap-3">
                   <ICONS.ShieldAlert className="text-red-500 shrink-0" size={18} />
                   <p className="text-xs text-slate-600 dark:text-slate-400">High resting heart rate detected. Ensure you are well-rested and hydrated.</p>
                 </div>
               )}
               <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-900/30 flex gap-3">
                 <ICONS.CheckCircle2 className="text-brand-500 shrink-0" size={18} />
                 <p className="text-xs text-slate-600 dark:text-slate-400">Weight is tracked at {vitals.weight}kg. Keep up the consistent logging!</p>
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
