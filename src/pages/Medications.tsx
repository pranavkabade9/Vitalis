import React, { useState } from 'react';
import { Card } from '../components/UI';
import { ICONS } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useHealth } from '../lib/store';

export default function Medications() {
  const { medications, toggleMedication, addMedication, removeMedication } = useHealth();
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '' });

  const compliance = medications.length > 0
    ? Math.round((medications.filter(m => m.takenToday).length / medications.length) * 100)
    : 100;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dosage) return;
    addMedication(newMed);
    setNewMed({ name: '', dosage: '', frequency: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Active Medications</h2>
          <p className="text-sm text-slate-500">Manage your daily prescriptions and supplements</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-500/20 transition-all active:scale-95"
        >
          <ICONS.Plus size={20} /> Add Medication
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-brand-500/20 shadow-xl"
          >
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Med Name</label>
                <input 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newMed.name}
                  onChange={e => setNewMed({...newMed, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dosage</label>
                <input 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newMed.dosage}
                  onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Frequency</label>
                <input 
                  required
                  placeholder="e.g. Daily"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newMed.frequency}
                  onChange={e => setNewMed({...newMed, frequency: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 py-3 bg-brand-500 text-white font-bold rounded-xl active:scale-95 transition-all">Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {medications.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "group relative overflow-hidden transition-all duration-300",
                med.takenToday && "border-brand-500/30 bg-brand-50/10"
              )}>
                <button 
                  onClick={() => removeMedication(med.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <ICONS.Trash2 size={16} />
                </button>

                <div className="flex items-start justify-between mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    med.takenToday ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500"
                  )}>
                    <ICONS.Pill size={24} />
                  </div>
                  {med.takenToday && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded-full">
                      <ICONS.CheckCircle2 size={12} /> Logged
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{med.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{med.dosage}</p>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <ICONS.Bell size={14} className="text-brand-500" />
                    Now
                  </div>
                  <div className="flex items-center gap-2">
                    <ICONS.Calendar size={14} />
                    {med.frequency}
                  </div>
                </div>

                <button 
                  onClick={() => toggleMedication(med.id)}
                  className={cn(
                    "w-full mt-8 py-3 rounded-xl font-bold transition-all",
                    med.takenToday 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400" 
                      : "bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-brand-500/20"
                  )}
                >
                  {med.takenToday ? 'Taken' : 'Mark as Taken'}
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Compliance Tracking" icon="TrendingUp">
          <div className="flex items-center gap-10 py-4">
             <div className="shrink-0">
               <div className="text-5xl font-black text-brand-500">{compliance}%</div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Today's Rate</p>
             </div>
             <div className="flex-1 space-y-4">
                {[
                  { label: 'Weekly View', val: 75 },
                  { label: 'Monthly View', val: 92 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        className="h-full bg-brand-500"
                      />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </Card>

        <Card title="Health Note" icon="Activity">
          <p className="text-sm text-slate-500 leading-relaxed">
            Consistently taking your supplements can improve your overall health score by up to <strong className="text-brand-500">15 points</strong>. 
            Stay on track to see your <strong>Excellent</strong> status maintained!
          </p>
          <div className="mt-4 p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-900/30">
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-2">
              <ICONS.CheckCircle2 size={14} /> Tip: Add reminders to your calendar for better compliance.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
