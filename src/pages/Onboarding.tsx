import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Card } from '../components/UI';
import { useHealth } from '../lib/store';

export default function Onboarding() {
  const { updateGuestProfile } = useAuth();
  const { updateVitals } = useHealth();
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.age) return;
    
    setSubmitting(true);
    try {
      const weight = parseFloat(formData.weight) || 0;
      
      if (weight > 0) {
        updateVitals({ weight });
      }

      await updateGuestProfile({
        user_metadata: { 
          full_name: formData.full_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          height: parseFloat(formData.height) || 0,
          weight: weight,
        }
      });
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-10" title="Personalize Vitalis" subtitle="Tell us a bit about yourself to start.">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Alex Johnson"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Age</label>
              <input 
                required
                type="number" 
                min="1" max="120"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gender</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Height (cm)</label>
              <input 
                type="number" 
                placeholder="175"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Weight (kg)</label>
              <input 
                type="number" step="0.1"
                placeholder="70.5"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            Complete Onboarding
          </button>
        </form>
        
        <div className="mt-8 p-4 rounded-xl bg-yellow-50 dark:bg-warning-500/10 border border-yellow-100 dark:border-yellow-900/30 text-[10px] text-yellow-700 dark:text-yellow-500 font-bold uppercase tracking-widest leading-relaxed">
          ⚠️ Note: Guest data is stored locally. Sign in with Google to persist your records permanently.
        </div>
      </Card>
    </div>
  );
}
