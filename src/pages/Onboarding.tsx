import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Card } from '../components/UI';
import { useHealth } from '../lib/store';
import { motion } from 'motion/react';

export default function Onboarding() {
  const { user, isGuest, updateGuestProfile } = useAuth();
  const { profile, updateProfile, updateVitals } = useHealth();
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    height: '',
    weight: '',
    conditions: '',
    allergies: '',
    medications: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSkip = async () => {
    if (!isGuest) {
      await updateProfile({ profileCompleted: false });
    }
    sessionStorage.setItem('vitalis-onboarding-skipped', 'true');
    window.location.reload(); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on user type
    if (isGuest) {
      if (!formData.full_name || !formData.age) return;
    } else {
      if (!formData.age || !formData.gender) return;
    }
    
    setSubmitting(true);
    try {
      const age = parseInt(formData.age);
      const height = parseFloat(formData.height) || 0;
      const weight = parseFloat(formData.weight) || 0;
      
      if (isGuest) {
        // Minimal update for Guest
        await updateGuestProfile({
          user_metadata: { 
            full_name: formData.full_name,
            age,
            height,
            weight
          }
        });
        
        // Also update health store if possible
        updateProfile({ age, height, weight, profileCompleted: true });
      } else {
        // Full update for Google User
        await updateProfile({
          age,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          height,
          weight,
          medicalConditions: formData.conditions,
          allergies: formData.allergies,
          medicationsInfo: formData.medications,
          profileCompleted: true
        });
      }

      if (weight > 0) {
        updateVitals({ weight });
      }
      
      sessionStorage.removeItem('vitalis-onboarding-skipped');
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isGuest) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full py-8"
        >
          <Card className="p-6 sm:p-10" title="Quick Setup" subtitle="Just a few basics to get your guest session started.">
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Name*</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Pranav Kabade"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age*</label>
                    <input 
                      required
                      type="number" 
                      min="1" max="120"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      placeholder="175"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                    <input 
                      type="number" step="0.1"
                      placeholder="70.5"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Setting up...' : 'Start Guest Session'}
                </button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full py-8"
      >
        <Card className="p-6 sm:p-10" title="Complete Your Health Profile" subtitle="Help us personalize your monitoring experience.">
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BASIC INFO */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basic Info</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pranav Kabade"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age*</label>
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
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender*</label>
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
              </div>

              {/* HEALTH INFO */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Health Info</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 175"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Weight (kg)</label>
                    <input 
                      type="number" step="0.1"
                      placeholder="e.g. 70"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MEDICAL DETAILS */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Medical Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Existing Conditions</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hypertension, None"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={formData.conditions}
                    onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Allergies</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Current Medications</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Metformin 500mg"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="button"
                onClick={handleSkip}
                className="flex-1 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all order-2 sm:order-1"
              >
                Skip for Now
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-[2] py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all order-1 sm:order-2 flex items-center justify-center gap-2"
              >
                {submitting ? 'Saving...' : 'Save Information'}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
