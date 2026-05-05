import React from 'react';
import { Card } from '../components/UI';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../lib/auth';
import { ICONS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, isGuest, upgradeToGoogle, isMigrating } = useAuth();

  const handleExportData = (format: 'json' | 'csv') => {
    // In a real app, we would fetch all data from Supabase/LocalStorage
    const mockData = {
      profile: user?.user_metadata || {},
      vitals: [
        { date: '2026-05-01', hr: 72, bp: '120/80', weight: 75.5 },
        { date: '2026-05-02', hr: 75, bp: '122/82', weight: 75.2 },
      ],
      lifestyle: [
        { date: '2026-05-01', sleep: 7, water: 2000, steps: 8000 },
        { date: '2026-05-02', sleep: 6.5, water: 1500, steps: 6000 },
      ]
    };

    let content = '';
    let mimeType = '';
    let fileName = `vitalis_data_${user?.user_metadata?.full_name || 'user'}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      content = JSON.stringify(mockData, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      // Very simple CSV conversion for demonstration
      content = 'Date,HR,BP,Weight,Sleep,Water,Steps\n';
      mockData.vitals.forEach((v, i) => {
        const l = mockData.lifestyle[i] as any || {};
        content += `${v.date},${v.hr},${v.bp},${v.weight},${l.sleep || ''},${l.water || ''},${l.steps || ''}\n`;
      });
      mimeType = 'text/csv';
      fileName += '.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Appearance" subtitle="Customize how Vitalis looks on your device" icon="Settings">
          <div className="space-y-4 pt-2">
            {[
              { id: 'light', label: 'Light Mode', icon: 'Sun' },
              { id: 'dark', label: 'Dark Mode', icon: 'Moon' },
              { id: 'system', label: 'System Default', icon: 'Settings' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id as any)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                  theme === option.id 
                    ? "border-brand-500 bg-brand-50/10 text-brand-500 shadow-sm" 
                    : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === option.id ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <SettingsIcon name={option.icon} />
                  </div>
                  <span className="font-bold text-sm tracking-tight">{option.label}</span>
                </div>
                {theme === option.id && <ICONS.CheckCircle2 size={18} />}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Privacy & Data" subtitle="Export your health data for personal use" icon="ShieldAlert">
          <div className="space-y-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
               <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Download Your Data</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                 You can download a complete copy of your health records, including vitals, lifestyle logs, and medication history.
               </p>
               
               <div className="grid grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={() => handleExportData('json')}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50/10 transition-all group"
                >
                  <span className="text-xs font-black text-slate-400 group-hover:text-brand-500 tracking-widest uppercase">JSON</span>
                  <span className="text-[10px] font-bold text-slate-500">Developer Format</span>
                </button>
                <button 
                  onClick={() => handleExportData('csv')}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50/10 transition-all group"
                >
                  <span className="text-xs font-black text-slate-400 group-hover:text-brand-500 tracking-widest uppercase">CSV</span>
                  <span className="text-[10px] font-bold text-slate-500">Excel / Tabular</span>
                </button>
               </div>
            </div>

            {isGuest && (
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-900/30">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                    <ICONS.AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Guest Account</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Your data is stored only in this browser's local cache. Linking a Google account will synchronize and protect your data across all devices.
                    </p>
                    <button 
                      onClick={upgradeToGoogle}
                      disabled={isMigrating}
                      className={cn(
                        "mt-4 text-xs font-bold uppercase tracking-widest transition-all",
                        isMigrating ? "text-slate-400 cursor-not-allowed" : "text-orange-500 hover:underline"
                      )}
                    >
                      {isMigrating ? "Migrating Data..." : "Upgrade to Google Account"}
                    </button>
                  </div>
                </div>
                {isMigrating && (
                  <div className="mt-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-900/30 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">Data Migration in Progress</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="App Information" icon="Activity">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-2">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Version</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white">1.2.0-stable</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Architecture</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white">Rule-Based SDK</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Deployment</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white">Vercel Edge</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

const SettingsIcon = ({ name }: { name: string }) => {
  if (name === 'Sun') return <ICONS.Sun size={20} />;
  if (name === 'Moon') return <ICONS.Moon size={20} />;
  return <ICONS.Settings size={20} />;
};
