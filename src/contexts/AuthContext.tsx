"use client";

import React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  const checkAuth = async () => {
    try {
      // Try localStorage first, then sessionStorage as backup
      let token = localStorage.getItem("token");
      if (!token) {
        token = sessionStorage.getItem("token");
        if (token) {
          // Move from sessionStorage to localStorage
          localStorage.setItem("token", token);
        }
      }
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          // Handle the response format correctly
          if (response.data.status === 'success') {
            setUser(response.data.data.user);
          } else {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
          }
        } catch (error) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
        }
      }
    } catch (err) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authAPI.login({ email, password });
      
      // Handle the response format correctly
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        localStorage.setItem("token", response.data.data.token);
        // Also store in sessionStorage as backup
        sessionStorage.setItem("token", response.data.data.token);
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      // Handle the response format correctly
      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        localStorage.setItem("token", response.data.data.token);
        // Also store in sessionStorage as backup
        sessionStorage.setItem("token", response.data.data.token);
        return { success: true };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = (redirectToHomepage: boolean = false) => {
    // Clear user data immediately
    setUser(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
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
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Profile update failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      const response = await authAPI.updatePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Password update failed";
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
