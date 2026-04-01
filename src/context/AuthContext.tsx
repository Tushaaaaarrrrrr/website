import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { saveProfileDetails, syncProfileFromAuth } from '../services/profileService';
import type { Profile, WebsiteRole } from '../types/app';
import { isProfileComplete } from '../utils/profile';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  role: WebsiteRole;
  isManager: boolean;
  isProfileComplete: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (values: { name: string; phone: string; gender: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = React.useRef<any>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, phone, gender, role')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        setProfile(null);
        return;
      }

      setProfile({
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        role: data.role === 'MANAGER' ? 'MANAGER' : 'STUDENT',
        rawRole: data.role,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        const currUser = session?.user ?? null;
        setUser(currUser);
        
        if (currUser) {
          try {
            setProfile(await syncProfileFromAuth(currUser));
          } catch (profileErr) {
            console.error('Failed to sync profile on init:', profileErr);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Init Auth Error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const currUser = session?.user ?? null;
        setUser(currUser);
        
        if (currUser) {
          try {
            setProfile(await syncProfileFromAuth(currUser));
          } catch (profileErr) {
            console.error('Failed to sync profile on auth change:', profileErr);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth State Change Error:', err);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    subscriptionRef.current = subscription;
    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Sign in error:', error.message);
  };

  const signOut = async () => {
    try {
      // Unsubscribe from auth listener first to prevent conflicts
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      
      // Immediately clear state
      setUser(null);
      setProfile(null);
      
      // Clear all browser storage (prevents cache issues)
      localStorage.clear();
      sessionStorage.clear();
      
      // Attempt to sign out from Supabase with a short timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 2000)
      );
      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const saveProfile = async (values: { name: string; phone: string; gender: string }) => {
    if (!user) {
      throw new Error('User session not found.');
    }

    const updatedProfile = await saveProfileDetails({
      user,
      existingProfile: profile,
      name: values.name,
      phone: values.phone,
      gender: values.gender,
    });

    setProfile(updatedProfile);
  };

  const role = profile?.role === 'MANAGER' ? 'MANAGER' : 'STUDENT';
  const isManager = role === 'MANAGER';
  const profileComplete = isProfileComplete(profile);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role,
        isManager,
        isProfileComplete: profileComplete,
        signInWithGoogle,
        signOut,
        refreshProfile,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
