import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth';
import { supabase, isSupabaseConfigured } from './supabase';

export interface VitalLog {
  heart_rate: number;
  blood_pressure_sys: number;
  blood_pressure_dia: number;
  weight: number;
  timestamp: string;
}

export interface LifestyleLog {
  sleep_hours: number;
  water_ml: number;
  steps: number;
  timestamp: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenToday: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  isPrimary: boolean;
}

export interface ProfileData {
  bloodGroup: string;
  medicalConditions: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  medicationsInfo?: string;
  profileCompleted: boolean;
}

interface HealthContextType {
  vitals: VitalLog;
  lifestyle: LifestyleLog;
  medications: Medication[];
  profile: ProfileData;
  emergencyContacts: EmergencyContact[];
  loading: boolean;
  updateVitals: (vitals: Partial<VitalLog>) => void;
  updateLifestyle: (lifestyle: Partial<LifestyleLog>) => void;
  updateProfile: (profile: Partial<ProfileData>) => void;
  updateEmergencyContacts: (contacts: EmergencyContact[]) => void;
  toggleMedication: (id: string) => void;
  addMedication: (med: Omit<Medication, 'id' | 'takenToday'>) => void;
  removeMedication: (id: string) => void;
  healthScore: number;
}

const DEFAULT_VITALS: VitalLog = {
  heart_rate: 72,
  blood_pressure_sys: 120,
  blood_pressure_dia: 80,
  weight: 70,
  timestamp: new Date().toISOString(),
};

const DEFAULT_LIFESTYLE: LifestyleLog = {
  sleep_hours: 8,
  water_ml: 2000,
  steps: 8000,
  timestamp: new Date().toISOString(),
};

const DEFAULT_PROFILE: ProfileData = {
  bloodGroup: 'Not provided',
  medicalConditions: 'Not provided',
  allergies: 'None',
  medicationsInfo: 'None',
  profileCompleted: false
};

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { user, isGuest } = useAuth();
  const [vitals, setVitalsState] = useState<VitalLog>(DEFAULT_VITALS);
  const [lifestyle, setLifestyleState] = useState<LifestyleLog>(DEFAULT_LIFESTYLE);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (isSupabaseConfigured && !isGuest && user) {
        // Load from Supabase
        try {
          const { data: vitalsData } = await supabase
            .from('vitals')
            .select('*')
            .order('logged_at', { ascending: false })
            .limit(1);
          
          if (vitalsData?.[0]) {
            setVitalsState({
              heart_rate: vitalsData[0].heart_rate,
              blood_pressure_sys: vitalsData[0].systolic_bp,
              blood_pressure_dia: vitalsData[0].diastolic_bp,
              weight: vitalsData[0].weight_kg,
              timestamp: vitalsData[0].logged_at
            });
          }

          const { data: lifestyleData } = await supabase
            .from('lifestyle_logs')
            .select('*')
            .order('logged_at', { ascending: false })
            .limit(1);

          if (lifestyleData?.[0]) {
            setLifestyleState({
              sleep_hours: lifestyleData[0].sleep_hours,
              water_ml: lifestyleData[0].water_intake_ml,
              steps: lifestyleData[0].steps,
              timestamp: lifestyleData[0].logged_at
            });
          }

          const { data: medsData } = await supabase
            .from('medications')
            .select('*')
            .eq('active', true);

          if (medsData) {
            setMedications(medsData.map((m: any) => ({
              id: m.id,
              name: m.name,
              dosage: m.dosage,
              frequency: m.frequency,
              takenToday: false
            })));
          }

          // Load profile extra info from users table
          const { data: userData } = await supabase
            .from('users')
            .select('blood_group, medical_conditions, age, gender, height, weight, allergies, medications_info, profile_completed')
            .eq('id', user.id)
            .single();

          if (userData) {
            setProfile({
              bloodGroup: userData.blood_group || 'Not provided',
              medicalConditions: userData.medical_conditions || 'Not provided',
              age: userData.age,
              gender: userData.gender,
              height: userData.height,
              weight: userData.weight,
              allergies: userData.allergies || 'None',
              medicationsInfo: userData.medications_info || 'None',
              profileCompleted: userData.profile_completed || false
            });
          }

          // Load emergency contacts
          const { data: contactsData } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('user_id', user.id);

          if (contactsData) {
            setEmergencyContacts(contactsData.map((c: any) => ({
              id: c.id,
              name: c.name,
              phone: c.phone,
              isPrimary: c.is_primary
            })));
          }

        } catch (error) {
          console.error('Error loading data from Supabase:', error);
        }
      } else {
        // Load from Local Storage
        const savedVitals = localStorage.getItem('vitalis-vitals');
        const savedLifestyle = localStorage.getItem('vitalis-lifestyle');
        const savedMeds = localStorage.getItem('vitalis-meds');
        const savedProfile = localStorage.getItem('vitalis-profile');
        const savedContacts = localStorage.getItem('vitalis-contacts');

        if (savedVitals) setVitalsState(JSON.parse(savedVitals));
        if (savedLifestyle) setLifestyleState(JSON.parse(savedLifestyle));
        if (savedMeds) setMedications(JSON.parse(savedMeds));
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedContacts) setEmergencyContacts(JSON.parse(savedContacts));
      }
      setLoading(false);
    };

    loadData();
  }, [user, isGuest]);

  // Save to local storage (fallback/guest)
  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-vitals', JSON.stringify(vitals));
    }
  }, [vitals, isGuest]);

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-lifestyle', JSON.stringify(lifestyle));
    }
  }, [lifestyle, isGuest]);

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-meds', JSON.stringify(medications));
    }
  }, [medications, isGuest]);

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-profile', JSON.stringify(profile));
    }
  }, [profile, isGuest]);

  useEffect(() => {
    if (isGuest || !isSupabaseConfigured) {
      localStorage.setItem('vitalis-contacts', JSON.stringify(emergencyContacts));
    }
  }, [emergencyContacts, isGuest]);

  const updateVitals = async (newVitals: Partial<VitalLog>) => {
    const updated = { ...vitals, ...newVitals, timestamp: new Date().toISOString() };
    setVitalsState(updated);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        await supabase.from('vitals').insert({
          user_id: user.id,
          heart_rate: updated.heart_rate,
          systolic_bp: updated.blood_pressure_sys,
          diastolic_bp: updated.blood_pressure_dia,
          weight_kg: updated.weight,
          logged_at: updated.timestamp
        });
      } catch (e) {
        console.error('Error updating vitals:', e);
      }
    }
  };

  const updateLifestyle = async (newLifestyle: Partial<LifestyleLog>) => {
    const updated = { ...lifestyle, ...newLifestyle, timestamp: new Date().toISOString() };
    setLifestyleState(updated);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        await supabase.from('lifestyle_logs').insert({
          user_id: user.id,
          sleep_hours: updated.sleep_hours,
          water_intake_ml: updated.water_ml,
          steps: updated.steps,
          logged_at: updated.timestamp
        });
      } catch (e) {
        console.error('Error updating lifestyle:', e);
      }
    }
  };

  const updateProfile = async (newProfile: Partial<ProfileData>) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        await supabase.from('users').update({
          blood_group: updated.bloodGroup,
          medical_conditions: updated.medicalConditions,
          age: updated.age,
          gender: updated.gender,
          height: updated.height,
          weight: updated.weight,
          allergies: updated.allergies,
          medications_info: updated.medicationsInfo,
          profile_completed: updated.profileCompleted
        }).eq('id', user.id);
      } catch (e) {
        console.error('Error updating profile:', e);
      }
    }
  };

  const updateEmergencyContacts = async (contacts: EmergencyContact[]) => {
    setEmergencyContacts(contacts);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        // Simplified: delete all and re-insert
        await supabase.from('emergency_contacts').delete().eq('user_id', user.id);
        if (contacts.length > 0) {
          await supabase.from('emergency_contacts').insert(
            contacts.map(c => ({
              user_id: user.id,
              name: c.name,
              phone: c.phone,
              is_primary: c.isPrimary
            }))
          );
        }
      } catch (e) {
        console.error('Error updating contacts:', e);
      }
    }
  };

  const toggleMedication = (id: string) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m));
  };

  const addMedication = async (med: Omit<Medication, 'id' | 'takenToday'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newMed: Medication = {
      ...med,
      id: newId,
      takenToday: false,
    };
    setMedications(prev => [...prev, newMed]);

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        await supabase.from('medications').insert({
          id: newId,
          user_id: user.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          active: true
        });
      } catch (e) {
        console.error('Error adding meditation:', e);
      }
    }
  };

  const removeMedication = async (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));

    if (isSupabaseConfigured && !isGuest && user) {
      try {
        await supabase.from('medications').update({ active: false }).eq('id', id);
      } catch (e) {
        console.error('Error removing medication:', e);
      }
    }
  };

  const calculateHealthScore = () => {
    let score = 0;
    
    // Sleep (30%)
    if (lifestyle.sleep_hours >= 7 && lifestyle.sleep_hours <= 9) score += 30;
    else if (lifestyle.sleep_hours >= 6) score += 20;
    else if (lifestyle.sleep_hours > 0) score += 10;

    // Water (20%)
    if (lifestyle.water_ml >= 2000) score += 20;
    else if (lifestyle.water_ml >= 1000) score += 10;

    // Steps (30%)
    if (lifestyle.steps >= 10000) score += 30;
    else if (lifestyle.steps >= 7000) score += 20;
    else if (lifestyle.steps >= 3000) score += 10;

    // Vitals (20%)
    if (vitals.heart_rate >= 60 && vitals.heart_rate <= 100) score += 10;
    if (vitals.blood_pressure_sys >= 110 && vitals.blood_pressure_sys <= 130) score += 5;
    if (vitals.blood_pressure_dia >= 70 && vitals.blood_pressure_dia <= 90) score += 5;

    return Math.min(score, 100);
  };

  return (
    <HealthContext.Provider value={{ 
      vitals, 
      lifestyle, 
      medications, 
      profile,
      emergencyContacts,
      loading,
      updateVitals, 
      updateLifestyle, 
      updateProfile,
      updateEmergencyContacts,
      toggleMedication,
      addMedication,
      removeMedication,
      healthScore: calculateHealthScore() 
    }}>
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
}
