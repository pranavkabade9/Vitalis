import React, { useState, useEffect } from 'react';
import { Card, MetricCard, ProgressRing } from '../components/UI';
import { ICONS, HEALTH_CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { useHealth } from '../lib/store';
import { useAuth } from '../lib/auth';
import { generateHealthReport } from '../lib/pdfReport';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { motion } from 'motion/react';

const MOCK_HISTORICAL_DATA = [
  { name: 'Mon', score: 85, water: 2100, steps: 8400 },
  { name: 'Tue', score: 72, water: 1800, steps: 6000 },
  { name: 'Wed', score: 90, water: 2500, steps: 11000 },
  { name: 'Thu', score: 88, water: 2200, steps: 9500 },
  { name: 'Fri', score: 95, water: 2400, steps: 12000 },
  { name: 'Sat', score: 80, water: 1500, steps: 5000 },
  { name: 'Sun', score: 78, water: 1600, steps: 4000 },
];

export default function Dashboard() {
  const { vitals, lifestyle, medications, toggleMedication, healthScore } = useHealth();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const handleExport = () => {
    generateHealthReport(
      user?.user_metadata?.full_name || 'User',
      vitals,
      lifestyle,
      medications,
      healthScore
    );
  };

  const getHealthCategory = (score: number) => {
    if (score >= 80) return HEALTH_CATEGORIES.EXCELLENT;
    if (score >= 50) return HEALTH_CATEGORIES.AVERAGE;
    return HEALTH_CATEGORIES.POOR;
  };

  const category = getHealthCategory(healthScore);

  const compliance = medications.length > 0
    ? Math.round((medications.filter(m => m.takenToday).length / medications.length) * 100)
    : 100;

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Hi, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-sm font-medium text-slate-500">Your health journey summary is ready.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto"
        >
          <ICONS.Download size={18} />
          Export PDF Report
        </button>
      </div>

      {/* Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center py-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ICONS.Activity size={120} />
          </div>
          
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Overall Health</h2>
          <ProgressRing 
            value={healthScore} 
            size={180} 
            strokeWidth={14} 
            variant={healthScore >= 80 ? 'excellent' : healthScore >= 50 ? 'average' : 'poor'} 
          />
          <div className={cn("mt-6 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider", category.bg, category.color)}>
             {category.icon} {category.label}
          </div>
          <p className="mt-4 text-sm text-slate-500 max-w-[200px]">
            Your real-time health index based on tracked vitals and habits.
          </p>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard label="Sleep" value={lifestyle.sleep_hours.toString()} unit="hrs" icon="Moon" trend={lifestyle.sleep_hours >= 7 ? "Optimal" : "Poor"} status={lifestyle.sleep_hours < 7 ? "warning" : "normal"} />
          <MetricCard label="Water" value={lifestyle.water_ml.toLocaleString()} unit="ml" icon="Droplets" status={lifestyle.water_ml < 2000 ? "warning" : "normal"} trend={lifestyle.water_ml >= 2000 ? "Good" : "Low"} />
          <MetricCard label="Steps" value={lifestyle.steps.toLocaleString()} icon="Footprints" trend={lifestyle.steps >= 10000 ? "+Goal" : "Increasing"} />
          <MetricCard label="Heart Rate" value={vitals.heart_rate.toString()} unit="bpm" icon="Heart" trend="Stable" status={vitals.heart_rate > 100 ? "critical" : "normal"} />
        </div>
      </div>

      {/* Middle Section: Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Weekly Trends" subtitle="Overview of your health metrics" className="lg:col-span-2 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_HISTORICAL_DATA}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }} 
              />
              <Area type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Active Insights" icon="AlertTriangle" className="lg:col-span-1">
          <div className="space-y-4">
            {lifestyle.water_ml < 2000 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4 p-4 rounded-2xl bg-yellow-50 dark:bg-warning-500/10 border border-yellow-100 dark:border-yellow-900/30"
              >
                <div className="w-10 h-10 rounded-xl bg-warning-500/20 text-warning-500 flex items-center justify-center shrink-0">
                  <ICONS.Droplets size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Hydration Warning ⚠️</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">You are {2000 - lifestyle.water_ml}ml behind your daily goal.</p>
                </div>
              </motion.div>
            )}
            
            {medications.some(m => !m.takenToday) && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 p-4 rounded-2xl bg-red-50 dark:bg-critical-500/10 border border-red-100 dark:border-red-900/30"
              >
                <div className="w-10 h-10 rounded-xl bg-critical-500/20 text-critical-500 flex items-center justify-center shrink-0">
                  <ICONS.Pill size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Medication Reminder 🚨</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">You have pending doses for today.</p>
                </div>
              </motion.div>
            )}

            {lifestyle.steps >= 10000 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 p-4 rounded-2xl bg-green-50 dark:bg-brand-500/10 border border-green-100 dark:border-green-900/30"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-500 flex items-center justify-center shrink-0">
                  <ICONS.CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Step Goal Reached ✅</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Great job! You exceeded your daily step goal.</p>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section: Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="col-span-full md:col-span-2 lg:col-span-3" title="Daily Medication" subtitle="Status for today's prescriptions">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {medications.length > 0 ? medications.map(med => (
              <div key={med.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                 <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      med.takenToday ? "bg-brand-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    )}>
                      <ICONS.Pill size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{med.name}</p>
                      <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => toggleMedication(med.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    med.takenToday 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400" 
                      : "bg-brand-500 text-white hover:shadow-lg hover:shadow-brand-500/20"
                  )}
                 >
                   {med.takenToday ? 'Taken' : 'Mark Taken'}
                 </button>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-slate-400 text-sm font-medium">
                No medications added yet.
              </div>
            )}
          </div>
        </Card>
        
        <Card className="lg:col-span-1" title="Compliance" subtitle="Medicine consistency">
           <div className="flex flex-col items-center justify-center h-full">
              <div className="text-5xl font-extrabold text-brand-500 mb-2">{compliance}<span className="text-2xl">%</span></div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Efficiency</p>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${compliance}%` }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-brand-500"
                />
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
