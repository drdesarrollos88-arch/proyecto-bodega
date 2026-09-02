import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { store } from '../services/store';

interface AuthContextType {
  currentUser: UserProfile;
  setRole: (role: UserRole) => void;
  allUsers: UserProfile[];
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => store.getProfiles());
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bodega_current_user_id');
    const profiles = store.getProfiles();
    const found = profiles.find(p => p.id === saved);
    // Por defecto iniciar como Técnico para demostrar el flujo desde el inicio
    return found || profiles[0] || {
      id: 'USR-01',
      name: 'Carlos Muñoz Alarcón',
      rut: '16.894.221-5',
      role: 'tecnico',
      cost_center_id: 'CC-101',
      phone: '+56 9 8452 1190',
      email: 'carlos.munoz@empresa.cl'
    };
  });

  useEffect(() => {
    return store.subscribe(() => {
      const currentProfiles = store.getProfiles();
      setUsers(currentProfiles);
      const updatedCurrent = currentProfiles.find(p => p.id === currentUser.id);
      if (updatedCurrent) {
        setCurrentUser(updatedCurrent);
      }
    });
  }, [currentUser.id]);

  const setRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('bodega_current_user_id', targetUser.id);
    }
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('bodega_current_user_id', found.id);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setRole, allUsers: users, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

