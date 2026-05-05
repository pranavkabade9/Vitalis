import React, { useState } from 'react';
import { Card } from '../components/UI';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../lib/auth';
import { ICONS } from '../constants';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useHealth, EmergencyContact } from '../lib/store';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, isGuest, upgradeToGoogle, isMigrating } = useAuth();
  const { vitals, lifestyle, medications, profile, emergencyContacts, updateProfile, updateEmergencyContacts } = useHealth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', isPrimary: false });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) return;
    
    const newContact: EmergencyContact = {
      id: Math.random().toString(36).substr(2, 9),
      ...contactForm
    };
    
    const updatedContacts = contactForm.isPrimary 
      ? emergencyContacts.map(c => ({ ...c, isPrimary: false })).concat(newContact)
      : [...emergencyContacts, newContact];
      
    await updateEmergencyContacts(updatedContacts);
    setContactForm({ name: '', phone: '', isPrimary: false });
    setIsAddingContact(false);
  };

  const removeContact = async (id: string) => {
    await updateEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const handleExportData = (format: 'json' | 'csv') => {
    const realData = {
      user: {
        name: user?.user_metadata?.full_name,
        email: user?.email,
        profile: profile
      },
      current_vitals: vitals,
      current_lifestyle: lifestyle,
      medications: medications,
      emergency_contacts: emergencyContacts,
      export_date: new Date().toISOString()
    };

    let content = '';
    let mimeType = '';
    let fileName = `vitalis_data_${user?.user_metadata?.full_name || 'user'}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      content = JSON.stringify(realData, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      // CSV conversion
      content = 'Category,Key,Value,Timestamp\n';
      
      // Profile
      content += `Profile,Blood Group,${profile.bloodGroup},\n`;
      content += `Profile,Medical Conditions,${profile.medicalConditions},\n`;
      content += `Profile,Age,${profile.age || ''},\n`;
      
      // Vitals
      content += `Vitals,Heart Rate,${vitals.heart_rate},${vitals.timestamp}\n`;
      content += `Vitals,BP Systolic,${vitals.blood_pressure_sys},${vitals.timestamp}\n`;
      content += `Vitals,BP Diastolic,${vitals.blood_pressure_dia},${vitals.timestamp}\n`;
      content += `Vitals,Weight,${vitals.weight},${vitals.timestamp}\n`;

      // Lifestyle
      content += `Lifestyle,Sleep Hours,${lifestyle.sleep_hours},${lifestyle.timestamp}\n`;
      content += `Lifestyle,Water ML,${lifestyle.water_ml},${lifestyle.timestamp}\n`;
      content += `Lifestyle,Steps,${lifestyle.steps},${lifestyle.timestamp}\n`;
      
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
        <Card title="Medical Profile" subtitle="Information used for emergency alerts" icon="Activity">
          {isEditingProfile ? (
            <form onSubmit={handleProfileSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Age</label>
                  <input 
                    type="number"
                    value={profileForm.age || ''}
                    onChange={(e) => setProfileForm({...profileForm, age: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Gender</label>
                  <select 
                    value={profileForm.gender || 'Male'}
                    onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Blood Group</label>
                  <select 
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  >
                    <option value="Not provided">Select</option>
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
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Height (cm)</label>
                  <input 
                    type="number"
                    value={profileForm.height || ''}
                    onChange={(e) => setProfileForm({...profileForm, height: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Allergies</label>
                  <input 
                    type="text"
                    value={profileForm.allergies || ''}
                    onChange={(e) => setProfileForm({...profileForm, allergies: e.target.value})}
                    placeholder="e.g. None, Peanuts"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Medications</label>
                  <input 
                    type="text"
                    value={profileForm.medicationsInfo || ''}
                    onChange={(e) => setProfileForm({...profileForm, medicationsInfo: e.target.value})}
                    placeholder="e.g. None"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Medical Conditions</label>
                <textarea 
                  value={profileForm.medicalConditions}
                  onChange={(e) => setProfileForm({...profileForm, medicalConditions: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[100px]"
                  placeholder="e.g. Asthma, Diabetes, Heart condition..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-brand-500 text-white shadow-lg shadow-brand-500/20">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{profile.age || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{profile.gender || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{profile.bloodGroup}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Height (cm)</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">{profile.height || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Allergies</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{profile.allergies || 'None'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medications</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{profile.medicationsInfo || 'None'}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Medical Conditions</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{profile.medicalConditions}</p>
              </div>
              <button 
                onClick={() => {
                  setProfileForm(profile);
                  setIsEditingProfile(true);
                }}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:border-brand-500/50 hover:bg-brand-50/10 transition-all font-bold text-sm"
              >
                Edit Profile Info
              </button>
            </div>
          )}
        </Card>

        <Card title="Emergency Contacts" subtitle="Who we notify in case of emergency" icon="User">
          <div className="space-y-4 pt-2">
            {emergencyContacts.map(contact => (
              <div key={contact.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    contact.isPrimary ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <ICONS.User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{contact.name} {contact.isPrimary && <span className="ml-1 text-[10px] text-red-500 uppercase tracking-tighter">Primary</span>}</p>
                    <p className="text-xs text-slate-500">{contact.phone}</p>
                  </div>
                </div>
                <button onClick={() => removeContact(contact.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <ICONS.Trash2 size={18} />
                </button>
              </div>
            ))}

            {isAddingContact ? (
              <form onSubmit={handleAddContact} className="p-6 rounded-2xl border-2 border-brand-500/20 bg-brand-50/5 dark:bg-brand-500/5 space-y-4">
                <input 
                  autoFocus
                  placeholder="Contact Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input 
                  placeholder="Phone Number"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-brand-500"
                />
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input 
                    type="checkbox"
                    checked={contactForm.isPrimary}
                    onChange={(e) => setContactForm({...contactForm, isPrimary: e.target.checked})}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Mark as Primary</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsAddingContact(false)} className="flex-1 py-2 text-xs font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="flex-[2] py-3 bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20 active:scale-95 transition-all">Add Contact</button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setIsAddingContact(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:border-brand-500/50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
              >
                <ICONS.Plus size={18} />
                Add Emergency Contact
              </button>
            )}
          </div>
        </Card>
      </div>

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
