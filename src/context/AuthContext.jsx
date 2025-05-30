import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, getCurrentUser } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Open auth modal with specified mode
  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Close auth modal
  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  // Switch between login and signup modes
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  // Value to be provided to consumers
  const value = {
    currentUser,
    authModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};