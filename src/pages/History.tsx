import React, { useState } from 'react';
import { Card } from '../components/UI';
import { ICONS } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

const MOCK_MONTHLY_DATA = [
  { name: 'Week 1', heartRate: 72, sleep: 7.2, steps: 8500, score: 82 },
  { name: 'Week 2', heartRate: 74, sleep: 6.8, steps: 7200, score: 76 },
  { name: 'Week 3', heartRate: 70, sleep: 7.5, steps: 9400, score: 88 },
  { name: 'Week 4', heartRate: 68, sleep: 8.0, steps: 11000, score: 95 },
];

export default function History() {
  const [metric, setMetric] = useState<'score' | 'steps' | 'sleep'>('score');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Health Analytics</h2>
          <p className="text-sm text-slate-500">Dive deep into your health performance over time</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
          {[
            { id: 'score', label: 'Score' },
            { id: 'steps', label: 'Steps' },
            { id: 'sleep', label: 'Sleep' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setMetric(item.id as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                metric === item.id 
                  ? 'bg-brand-500 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'score' ? (
              <BarChart data={MOCK_MONTHLY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13}} />
                <Tooltip 
                   cursor={{ fill: 'rgba(34, 197, 94, 0.05)' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }}
                />
                <Bar dataKey="score" fill="#22c55e" radius={[12, 12, 0, 0]} barSize={60} />
              </BarChart>
            ) : (
              <LineChart data={MOCK_MONTHLY_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'white' }} />
                <Line type="monotone" dataKey={metric} stroke="#22c55e" strokeWidth={4} dot={{ r: 6, fill: '#22c55e', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Card title="Peak Performance" icon="TrendingUp">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white">95</span>
                <span className="text-sm font-bold text-slate-400">Score</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Highest health score achieved last week.</p>
           </Card>
           
           <Card title="Average Consistency" icon="Activity">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white">7.8</span>
                <span className="text-sm font-bold text-slate-400">Avg Sleep</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">You are maintaining a stable sleep pattern.</p>
           </Card>

           <Card title="Total Milestones" icon="CheckCircle2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white">12</span>
                <span className="text-sm font-bold text-slate-400">Goals</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">Goal completion rate improved by 15%.</p>
           </Card>
        </div>
      </div>
    </div>
  );
}
