import React from 'react';
import { Card } from '../components/UI';
import { ICONS } from '../constants';
import { motion } from 'motion/react';
import { useHealth } from '../lib/store';
import { cn } from '../lib/utils';

export default function Lifestyle() {
  const { lifestyle, updateLifestyle } = useHealth();

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Track Activity" subtitle="Update your lifestyle data for today">
          <div className="space-y-10 py-4">
            {/* Sleep Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <ICONS.Moon size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Sleep Hours</span>
                </div>
                <span className="text-lg font-bold text-indigo-500">{lifestyle.sleep_hours} hrs</span>
              </div>
              <input 
                type="range" min="0" max="15" step="0.5"
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                value={lifestyle.sleep_hours}
                onChange={(e) => updateLifestyle({ sleep_hours: parseFloat(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                <span>Too little</span>
                <span>Optimal (7-9)</span>
                <span>Too much</span>
              </div>
            </div>

            {/* Water Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <ICONS.Droplets size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Water Intake</span>
                </div>
                <span className="text-lg font-bold text-brand-500">{lifestyle.water_ml} ml</span>
              </div>
              <input 
                type="range" min="0" max="5000" step="100"
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                value={lifestyle.water_ml}
                onChange={(e) => updateLifestyle({ water_ml: parseInt(e.target.value) })}
              />
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                <span>Dehydrated</span>
                <span>Goal (2500)</span>
                <span>Hydrated</span>
              </div>
            </div>

            {/* Steps Input */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center">
                    <ICONS.Footprints size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Daily Steps</span>
                </div>
                <span className="text-lg font-bold text-green-500">{lifestyle.steps.toLocaleString()}</span>
              </div>
              <input 
                type="range" min="0" max="25000" step="500"
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                value={lifestyle.steps}
                onChange={(e) => updateLifestyle({ steps: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </Card>

        <Card title="Activity Summary" icon="Activity">
          <div className="flex flex-col items-center justify-center h-full py-6">
             <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                  <motion.circle 
                    cx="96" cy="96" r="80" stroke="#22c55e" strokeWidth="12" fill="transparent" strokeLinecap="round"
                    initial={{ strokeDasharray: "502", strokeDashoffset: "502" }}
                    animate={{ strokeDashoffset: (502 - Math.min(lifestyle.steps / 10000, 1) * 502).toString() }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{(lifestyle.steps / 1000).toFixed(1)}k</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Steps today</span>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 w-full mt-10">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-center">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Sleep Goal</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{lifestyle.sleep_hours >= 7 ? '✅' : '⚠️'} {lifestyle.sleep_hours}/7h</p>
                </div>
                <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-center">
                  <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">Hydration</p>
                  <p className="text-lg font-bold text-brand-600 dark:text-brand-400">{lifestyle.water_ml >= 2000 ? '✅' : '💧'} {lifestyle.water_ml}/2000ml</p>
                </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
