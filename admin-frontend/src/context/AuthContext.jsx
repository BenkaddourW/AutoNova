// src/context/AuthContext.jsx

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  useEffect(() => {
    const checkUserSession = () => {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Session invalide, nettoyage.", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, [logout]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      const userPayload = data.utilisateur;

      if (!userPayload) {
        throw new Error("Données utilisateur manquantes dans la réponse.");
      }
      
      setUser(userPayload);
      setToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(userPayload));
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      return data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    // --- CORRECTION MAJEURE ICI ---
    // On vérifie maintenant le champ 'role' (string) au lieu de 'roles' (array)
    isAdmin: user?.role === 'admin',
    isEmploye: user?.role === 'employe',
    isClient: user?.role === 'client',
    // Un utilisateur autorisé au dashboard est soit un admin, soit un employé
    isAuthorized: user?.role === 'admin' || user?.role === 'employe',
    // ===================================================
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};