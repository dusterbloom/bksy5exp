import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithBluesky } from '../services/bluesky';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedSession = localStorage.getItem('bluesky_session');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          setSession(sessionData);
        } catch (error) {
          console.error('Failed to parse stored session:', error);
          localStorage.removeItem('bluesky_session');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const response = await loginWithBluesky(identifier, password);
      console.log('Login response:', response); // Debug log

      if (response.success && response.data) {
        const sessionData = response.data;
        console.log('Setting session with:', sessionData); // Debug log
        setSession(sessionData);
        localStorage.setItem('bluesky_session', JSON.stringify(sessionData));
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Auth context login error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to login' 
      };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('bluesky_session');
  };

  const value = {
    session,
    login,
    logout,
    loading,
    isAuthenticated: !!session,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
