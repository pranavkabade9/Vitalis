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
      setLoading(true);
      if (firebaseUser) {
        let dbUser = null;
        // Sync with Supabase Users table
        if (isSupabaseConfigured) {
          try {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('id', firebaseUser.uid)
              .single();

            if (!existingUser) {
              const { data: newUser } = await supabase.from('users').insert({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                full_name: firebaseUser.displayName,
                created_at: new Date().toISOString(),
                is_guest: false
              }).select().single();
              dbUser = newUser;
            } else {
              dbUser = existingUser;
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
            avatar_url: firebaseUser.photoURL,
            age: dbUser?.age,
            gender: dbUser?.gender
          },
          is_guest: false
        });
        setIsGuest(false);
        handleMigrationIfNeeded(firebaseUser.uid);
        localStorage.removeItem('vitalis-guest-session');
      } else {
        const guestData = localStorage.getItem('vitalis-guest-session');
        if (guestData) {
          setUser(JSON.parse(guestData));
          setIsGuest(true);
        } else {
          setUser(null);
          setIsGuest(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMigrationIfNeeded = async (authenticatedId: string) => {
    const migrationPending = localStorage.getItem('vitalis-migration-pending');
    if (!migrationPending) return;

    try {
      setIsMigrating(true);
      
      const guestSession = localStorage.getItem('vitalis-guest-session');
      const vitals = JSON.parse(localStorage.getItem('vitalis-vitals') || '{}');
      const lifestyle = JSON.parse(localStorage.getItem('vitalis-lifestyle') || '{}');
      const medicationsArr = JSON.parse(localStorage.getItem('vitalis-meds') || '[]');

      if (isSupabaseConfigured && guestSession) {
        const guestUser = JSON.parse(guestSession);
        const guestId = guestUser.id;

        // 1. Update/Upsert the user record with the new authenticatedId
        const userData = {
          id: authenticatedId,
          email: guestUser.email === 'guest@vitalis.local' ? null : guestUser.email,
          full_name: guestUser.user_metadata?.full_name || 'Verified User',
          age: guestUser.user_metadata?.age,
          gender: guestUser.user_metadata?.gender,
          is_guest: false,
          created_at: new Date().toISOString()
        };
        await supabase.from('users').upsert(userData);

        // 2. Update references in other tables from guestId to authenticatedId
        const tables = ['vitals', 'lifestyle_logs', 'medications'];
        for (const table of tables) {
          await supabase.from(table).update({ user_id: authenticatedId }).eq('user_id', guestId);
        }

        // 3. Migrate any remaining local-only data that might not be in DB yet
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

        if (lifestyle.sleep_hours) {
          await supabase.from('lifestyle_logs').insert({
            user_id: authenticatedId,
            sleep_hours: lifestyle.sleep_hours,
            water_intake_ml: lifestyle.water_ml,
            steps: lifestyle.steps,
            logged_at: lifestyle.timestamp
          });
        }

        if (medicationsArr.length > 0) {
          const medsToInsert = medicationsArr.map((m: any) => ({
            user_id: authenticatedId,
            name: m.name,
            dosage: m.dosage,
            time: '08:00:00',
            frequency: m.frequency,
            active: true
          }));
          await supabase.from('medications').insert(medsToInsert);
        }

        // 4. Clean up the old guest record in users table
        if (guestId !== authenticatedId) {
          await supabase.from('users').delete().eq('id', guestId);
        }
      }

      console.log('Migration successful');
      localStorage.removeItem('vitalis-guest-session');
      localStorage.removeItem('vitalis-migration-pending');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
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

  const updateGuestProfile = async (profileData: any) => {
    if (isGuest && user) {
      const updatedUser = { ...user, ...profileData, onboarded: true };
      setUser(updatedUser);
      localStorage.setItem('vitalis-guest-session', JSON.stringify(updatedUser));

      // Save to Supabase if configured
      if (isSupabaseConfigured) {
        try {
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          const userData = {
            id: user.id,
            email: updatedUser.email || 'guest@vitalis.local',
            full_name: updatedUser.user_metadata?.full_name || 'Guest User',
            age: updatedUser.user_metadata?.age,
            gender: updatedUser.user_metadata?.gender,
            is_guest: true,
            created_at: new Date().toISOString()
          };

          if (!existingUser) {
            await supabase.from('users').insert(userData);
          } else {
            await supabase.from('users').update(userData).eq('id', user.id);
          }
        } catch (error) {
          console.error('Error saving guest profile to database:', error);
        }
      }
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
