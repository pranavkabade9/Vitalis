import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ICONS } from '../constants';
import { useAuth } from '../lib/auth';
import { useHealth } from '../lib/store';
import { cn } from '../lib/utils';

export default function SOSSystem({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { profile, emergencyContacts } = useHealth();
  const [step, setStep] = useState<'confirm' | 'processing' | 'preview'>('confirm');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const medicalInfo = {
    name: user?.user_metadata?.full_name || 'Not provided',
    age: profile.age || 'Not provided',
    gender: profile.gender || 'Not provided',
    bloodGroup: profile.bloodGroup || 'Not provided',
    conditions: profile.medicalConditions || 'Not provided',
    allergies: profile.allergies || 'None recorded',
    medications: profile.medicationsInfo || 'None recorded',
  };

  const handleConfirm = () => {
    setStep('processing');
    
    // Attempt to get location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setStep('preview');
          // Trigger vibration if available
          if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Location unavailable");
          setStep('preview');
        },
        { timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation not supported");
      setStep('preview');
    }
  };

  const mapsLink = location 
    ? `https://maps.google.com/?q=${location.lat},${location.lng}` 
    : null;

  const alertMessage = `🚨 EMERGENCY ALERT 🚨
Name: ${medicalInfo.name}
Age: ${medicalInfo.age} | Gender: ${medicalInfo.gender}
Blood Group: ${medicalInfo.bloodGroup}
Medical Info: ${medicalInfo.conditions}
Allergies: ${medicalInfo.allergies}
Medications: ${medicalInfo.medications}

I need immediate assistance.

Location: ${mapsLink || 'Location unavailable'}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EMERGENCY ALERT',
          text: alertMessage,
          url: mapsLink || undefined
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(alertMessage);
    alert("Emergency alert copied to clipboard");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          {step === 'confirm' && (
            <div className="p-8 sm:p-10 text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <ICONS.AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 italic">Emergency Alert</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                Are you sure you want to send an emergency alert? This will prepare a message with your location and medical information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 py-4 rounded-2xl font-bold bg-red-600 text-white shadow-lg shadow-red-600/40 transition-all hover:bg-red-700 active:scale-95"
                >
                  Confirm Alert
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-10 text-center py-20">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Fetching Location...</h2>
              <p className="text-sm text-slate-500">Preparing your emergency alert data.</p>
            </div>
          )}

          {step === 'preview' && (
            <div className="flex flex-col h-full max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-red-50/50 dark:bg-red-950/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center">
                    <ICONS.ShieldAlert size={20} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white italic">Alert Ready</h3>
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <ICONS.X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                  {alertMessage}
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency Contacts</h4>
                  {emergencyContacts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {emergencyContacts.map(contact => (
                        <div key={contact.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{contact.name}</p>
                            <p className="text-[10px] text-slate-500">{contact.phone}</p>
                          </div>
                          <a href={`tel:${contact.phone}`} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center transition-colors hover:bg-green-500 hover:text-white">
                            <ICONS.Phone size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">No emergency contacts saved</p>
                  )}
                </div>

                {locationError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-50 dark:bg-warning-500/10 border border-yellow-100 dark:border-yellow-900/30 text-[10px] font-bold text-yellow-700 dark:text-yellow-500 uppercase tracking-widest">
                    <ICONS.MapPin size={14} />
                    {locationError}. Alert generated without coordinates.
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-4">
                <button 
                  onClick={handleCopy}
                  className="flex-1 py-4 rounded-2xl font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95"
                >
                  <ICONS.Copy size={18} />
                  Copy
                </button>
                {('share' in navigator) && (
                  <button 
                    onClick={handleShare}
                    className="flex-1 py-4 rounded-2xl font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all hover:bg-brand-600 active:scale-95"
                  >
                    <ICONS.Share2 size={18} />
                    Share
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
