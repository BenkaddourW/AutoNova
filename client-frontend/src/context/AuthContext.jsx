import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import * as clientService from '../services/clientService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Le hook `useCallback` est utilisé pour mémoriser la fonction `logout`
  // et éviter des re-rendus inutiles dans les composants enfants.
  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      authService.logout(refreshToken).catch(err => {
        console.error("Échec de l'invalidation du token sur le serveur:", err);
      });
    }
    setUser(null);
    setClientProfile(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  // Ce useEffect se charge de vérifier la session au chargement initial de l'app.
  useEffect(() => {
    const checkUserSession = async () => {
      if (token) {
              console.log("Token found, attempting to fetch profile..."); // Autre log utile
        try {
          // La méthode la plus fiable : demander au backend qui nous sommes.
          // Si le token est valide, on aura le profil. Sinon, ça va échouer.
          const profileData = await clientService.getMyProfile();
          
          if (profileData) {
            // Le backend renvoie un objet avec `utilisateur` et les champs du client
            const { utilisateur, ...clientData } = profileData;
            setUser(utilisateur);
            setClientProfile(clientData);
          } else {
             // L'utilisateur est authentifié mais n'a pas encore de profil client
             const decodedUser = JSON.parse(atob(token.split('.')[1]));
             setUser(decodedUser);
             setClientProfile(null);
          }

        } catch (error) {
          console.error("Session invalide ou expirée.", error.message);
          logout(); // Nettoie la session si le token est invalide.
        }
      }
      setLoading(false);
    };

    checkUserSession();
  }, [token, logout]);


  const login = async (email, motdepasse) => {
    const { accessToken, refreshToken, utilisateur } = await authService.login({ email, motdepasse });
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(utilisateur);
    setToken(accessToken); // Déclenchera le useEffect pour charger le profil client
  };
  
  const register = async (userData) => {
    await authService.register(userData);
    await login(userData.email, userData.motdepasse);
  };

  const refreshProfile = useCallback(async () => {
    if (token) {
      try {
        const profileData = await clientService.getMyProfile();
         if (profileData) {
            const { utilisateur, ...clientData } = profileData;
            setUser(utilisateur);
            setClientProfile(clientData);
          }
      } catch (error) {
        console.error("Impossible de rafraîchir le profil", error);
        logout();
      }
    }
  }, [token, logout]);

  const value = {
    user,
    clientProfile,
    token,
    loading,
    isAuthenticated: !!user,
    isProfileComplete: !!clientProfile,
    login,
    logout,
    register,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
