"use client";

import React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { authAPI } from "@/services/api";
import LogoutTransition from "@/components/LogoutTransition";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  licenseNumber?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
  isRadiologist: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure the API is ready
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Temporarily disable auth state change listener to debug homepage reloading
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event: string, session: any) => {
    //     console.log('Auth state change:', event, session?.user?.id);
        
    //     if (event === 'SIGNED_IN' && session?.user) {
    //       try {
    //         const response = await authAPI.getMe();
    //         if (response.data?.status === 'success') {
    //           console.log('User loaded from auth state change:', response.data.data.user.id);
    //           setUser(response.data.data.user);
    //         }
    //       } catch (e) {
    //         console.error('Error loading user in auth state change:', e);
    //       }
    //     } else if (event === 'SIGNED_OUT') {
    //       console.log('User signed out');
    //       setUser(null);
    //     }
    //   }
    // );

    // return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('checkAuth called');
      
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // Use Supabase client-side authentication
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        setLoading(false);
        return;
      }

      console.log('Session check result:', session?.user?.id || 'no session');

      if (session?.user) {
        // Prefer server endpoint to bypass RLS and ensure consistent profile fetch
        try {
          const response = await authAPI.getMe();
          if (response.data?.status === 'success') {
            console.log('User loaded from checkAuth:', response.data.data.user.id);
            setUser(response.data.data.user);
          }
        } catch (e) {
          console.error('Error loading user in checkAuth:', e);
        }
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔍 Login attempt for:', email);
      setError(null);
      
      // Use client-side Supabase authentication
      console.log('🔍 Attempting Supabase signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('❌ Supabase auth error:', error.message);
        return { success: false, error: error.message };
      }

      if (!data.user) {
        console.log('❌ No user returned from Supabase');
        return { success: false, error: 'Authentication failed' };
      }

      console.log('✅ Supabase authentication successful:', data.user.id);

      // Fetch full user object via server to avoid RLS
      try {
        console.log('🔍 Calling authAPI.getMe()...');
        const response = await authAPI.getMe();
        console.log('📡 authAPI.getMe() response:', response.data);
        
        if (response.data?.status !== 'success') {
          console.log('❌ getMe failed:', response.data?.message);
          return { success: false, error: response.data?.message || 'User profile not found' };
        }
        
        const fullUser = response.data.data.user;
        console.log('✅ User profile loaded:', fullUser.id, fullUser.role);

        // Attempt to update last login (best-effort; ignore errors)
        try {
          await supabase
            .from('profiles')
            .update({
              lastlogin: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', fullUser.id);
          console.log('✅ Last login updated');
        } catch (updateError) {
          console.log('⚠️ Last login update failed (ignored):', updateError);
        }

        setUser(fullUser);
        console.log('✅ Login completed successfully');
      } catch (e: any) {
        console.log('❌ Error in getMe call:', e.message);
        return { success: false, error: 'User profile not found' };
      }

      return { success: true };
    } catch (err: any) {
      console.log('❌ Login error:', err.message);
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      
      // Use client-side Supabase authentication
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'patient',
            specialization: userData.specialization,
            licenseNumber: userData.licenseNumber
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed' };
      }

      // The profile will be automatically created by the database trigger
      // Set user data
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'patient',
        specialization: userData.specialization,
        licenseNumber: userData.licenseNumber
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = (redirectToHomepage: boolean = false) => {
    // Clear user data immediately
    setUser(null);
    
    // Sign out from Supabase
    supabase.auth.signOut();
    
    // Show logout animation briefly
    setIsLoggingOut(true);
    
    // Complete logout after animation
    setTimeout(() => {
      setIsLoggingOut(false);
      // Use window.location.replace for cleaner redirect
      window.location.replace('/');
    }, 1500);
  };

  const handleLogoutComplete = () => {
    // This function is no longer needed as we handle everything in logout
    setIsLoggingOut(false);
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setError(null);
      
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          specialization: profileData.specialization,
          licensenumber: profileData.licenseNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...profileData } : null);
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Password update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isDoctor: user?.role === "doctor" || user?.role === "admin",
    isRadiologist: user?.role === "radiologist" || user?.role === "admin",
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
              <LogoutTransition 
          isLoggingOut={isLoggingOut} 
        />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
