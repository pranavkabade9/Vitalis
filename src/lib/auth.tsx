import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { auth, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: any | null;
  isGuest: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  updateGuestProfile: (data: any) => void;
  upgradeToGoogle: () => Promise<void>;
  isMigrating: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with Supabase Users table
        if (isSupabaseConfigured) {
          try {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', firebaseUser.uid)
              .single();

            if (!existingUser) {
              await supabase.from('users').insert({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                full_name: firebaseUser.displayName,
                created_at: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error syncing user with Supabase:', error);
          }
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          user_metadata: {
            full_name: firebaseUser.displayName,
            avatar_url: firebaseUser.photoURL
          }
        });
        setIsGuest(false);
        handleMigrationIfNeeded(firebaseUser.uid);
        localStorage.removeItem('vitalis-guest-session');
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const handleMigrationIfNeeded = async (authenticatedId: string) => {
    const migrationPending = localStorage.getItem('vitalis-migration-pending');
    if (!migrationPending) return;

    try {
      setIsMigrating(true);
      
      const vitals = JSON.parse(localStorage.getItem('vitalis-vitals') || '{}');
      const lifestyle = JSON.parse(localStorage.getItem('vitalis-lifestyle') || '{}');
      const medications = JSON.parse(localStorage.getItem('vitalis-meds') || '[]');

      // 1. Migrate Vitals
      if (vitals.heart_rate) {
        await supabase.from('vitals').insert({
          user_id: authenticatedId,
          heart_rate: vitals.heart_rate,
          systolic_bp: vitals.blood_pressure_sys,
          diastolic_bp: vitals.blood_pressure_dia,
          weight_kg: vitals.weight,
          logged_at: vitals.timestamp
        });
      }

      // 2. Migrate Lifestyle
      if (lifestyle.sleep_hours) {
        await supabase.from('lifestyle_logs').insert({
          user_id: authenticatedId,
          sleep_hours: lifestyle.sleep_hours,
          water_intake_ml: lifestyle.water_ml,
          steps: lifestyle.steps,
          logged_at: lifestyle.timestamp
        });
      }

      // 3. Migrate Medications
      if (medications.length > 0) {
        const medsToInsert = medications.map((m: any) => ({
          user_id: authenticatedId,
          name: m.name,
          dosage: m.dosage,
          time: '08:00:00', // Default time
          frequency: m.frequency,
          active: true
        }));
        await supabase.from('medications').insert(medsToInsert);
      }

      console.log('Migration successful');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      localStorage.removeItem('vitalis-migration-pending');
      setIsMigrating(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site to sign in with Google.');
      } else {
        alert('Failed to sign in with Google. Please try again.');
      }
    }
  };

  const upgradeToGoogle = async () => {
    localStorage.setItem('vitalis-migration-pending', 'true');
    await signInWithGoogle();
  };

  const signInAsGuest = () => {
    const guestData = localStorage.getItem('vitalis-guest-session');
    if (guestData) {
      setUser(JSON.parse(guestData));
      setIsGuest(true);
      return;
    }

    const guestId = crypto.randomUUID();
    const guestUser = {
      id: guestId,
      email: 'guest@vitalis.local',
      user_metadata: { full_name: 'Guest User' },
      is_guest: true,
      onboarded: false
    };
    setUser(guestUser);
    setIsGuest(true);
    localStorage.setItem('vitalis-guest-session', JSON.stringify(guestUser));
  };

  const updateGuestProfile = (profileData: any) => {
    if (isGuest && user) {
      const updatedUser = { ...user, ...profileData, onboarded: true };
      setUser(updatedUser);
      localStorage.setItem('vitalis-guest-session', JSON.stringify(updatedUser));
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('vitalis-guest-session');
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, signInWithGoogle, signInAsGuest, signOut, updateGuestProfile, upgradeToGoogle, isMigrating }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
