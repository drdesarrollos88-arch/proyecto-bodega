import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { store } from '../services/store';

interface AuthContextType {
  currentUser: UserProfile | null;
  activeUser: UserProfile | null;
  isAuthenticated: boolean;
  isEmulating: boolean;
  allUsers: UserProfile[];
  login: (identifier: string, password: string) => { success: boolean; error?: string };
  loginQuick: (userId: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  startEmulation: (user: UserProfile) => void;
  stopEmulation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => store.getProfiles());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bodega_auth_user_id');
    const profiles = store.getProfiles();
    return profiles.find((p) => p.id === saved) || null;
  });

  const [emulatedUser, setEmulatedUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bodega_emulated_user_id');
    const profiles = store.getProfiles();
    return profiles.find((p) => p.id === saved) || null;
  });

  useEffect(() => {
    return store.subscribe(() => {
      const currentProfiles = store.getProfiles();
      setUsers(currentProfiles);
      if (currentUser) {
        const updated = currentProfiles.find((p) => p.id === currentUser.id);
        if (updated) setCurrentUser(updated);
      }
      if (emulatedUser) {
        const updatedEm = currentProfiles.find((p) => p.id === emulatedUser.id);
        if (updatedEm) setEmulatedUser(updatedEm);
      }
    });
  }, [currentUser?.id, emulatedUser?.id]);

  const login = (identifier: string, password: string): { success: boolean; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const found = users.find(
      (u) =>
        u.id.toLowerCase() === cleanId ||
        u.rut.toLowerCase() === cleanId ||
        (u.email && u.email.toLowerCase() === cleanId)
    );

    if (!found) {
      return { success: false, error: 'Usuario no encontrado. Verifique su RUT o Correo.' };
    }

    const expectedPass = found.password || (found.role === 'superadmin' ? 'admin123' : '123456');
    if (cleanPass !== expectedPass) {
      return { success: false, error: 'Contraseña incorrecta. Intente nuevamente.' };
    }

    setCurrentUser(found);
    setEmulatedUser(null);
    localStorage.setItem('bodega_auth_user_id', found.id);
    localStorage.removeItem('bodega_emulated_user_id');
    return { success: true };
  };

  const loginQuick = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setEmulatedUser(null);
      localStorage.setItem('bodega_auth_user_id', found.id);
      localStorage.removeItem('bodega_emulated_user_id');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setEmulatedUser(null);
    localStorage.removeItem('bodega_auth_user_id');
    localStorage.removeItem('bodega_emulated_user_id');
  };

  const setRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      setEmulatedUser(null);
      localStorage.setItem('bodega_auth_user_id', found.id);
    }
  };

  const startEmulation = (user: UserProfile) => {
    if (currentUser?.role === 'superadmin') {
      setEmulatedUser(user);
      localStorage.setItem('bodega_emulated_user_id', user.id);
    }
  };

  const stopEmulation = () => {
    setEmulatedUser(null);
    localStorage.removeItem('bodega_emulated_user_id');
  };

  const activeUser = emulatedUser || currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeUser,
        isAuthenticated: !!currentUser,
        isEmulating: !!emulatedUser,
        allUsers: users,
        login,
        loginQuick,
        logout,
        setRole,
        startEmulation,
        stopEmulation,
      }}
    >
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
