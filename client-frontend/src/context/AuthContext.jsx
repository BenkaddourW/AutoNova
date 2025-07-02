// src/context/AuthContext.js (Version finale et corrigée)

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import * as clientService from '../services/clientService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

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

  // Ce useEffect vérifie la session au chargement de l'application.
  useEffect(() => {
    const checkUserSession = async () => {
      if (token) {
        try {
          // On demande au backend notre profil complet.
          // Le service est configuré pour retourner `null` en cas de 404, sans lancer d'erreur.
          const profileData = await clientService.getMyProfile();
          
          // Cas 1 : Le backend renvoie un profil client complet.
          if (profileData && profileData.idclient) {
            
            const { utilisateur, ...clientData } = profileData;

            // ✅ CORRECTION CLÉ : On fusionne les informations.
            // L'objet `user` contiendra maintenant l'id de l'utilisateur ET l'id du client.
            // C'est ce qui résout le problème de `idclient: undefined`.
            setUser({
              ...utilisateur,
              idclient: clientData.idclient 
            });
            
            setClientProfile(clientData);

          } else {
             // Cas 2 : L'utilisateur est authentifié (token valide) mais n'a pas encore de profil client (le 404).
             // Il ne pourra pas réserver. user.idclient sera `undefined`, ce qui est le comportement attendu.
             const decodedUser = JSON.parse(atob(token.split('.')[1]));
             setUser(decodedUser);
             setClientProfile(null); // On s'assure que le profil est explicitement null.
          }

        } catch (error) {
          // Le token est probablement invalide, expiré, ou une autre erreur serveur est survenue.
          console.error("Session invalide ou profil non trouvé.", error.message);
          logout(); // On nettoie complètement la session.
        }
      }
      // On a fini de vérifier, l'application peut s'afficher (le chargement est terminé).
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
    // Après l'inscription, on connecte directement l'utilisateur.
    await login(userData.email, userData.motdepasse);
  };

  // Permet de rafraîchir manuellement le profil (ex: après une mise à jour dans la page "compte")
  const refreshProfile = useCallback(async () => {
    if (token) {
      // On relance la même logique que dans le useEffect pour mettre à jour les données.
      try {
        const profileData = await clientService.getMyProfile();
         if (profileData && profileData.idclient) {
            const { utilisateur, ...clientData } = profileData;
            setUser({ ...utilisateur, idclient: clientData.idclient });
            setClientProfile(clientData);
          }
      } catch (error) {
        console.error("Impossible de rafraîchir le profil", error);
        logout();
      }
    }
  }, [token, logout]);

  // On expose toutes les valeurs et fonctions nécessaires au reste de l'application.
  const value = {
    user,
    clientProfile,
    token,
    loading,
    isAuthenticated: !!user,
    isProfileComplete: !!clientProfile, // Devient `true` seulement si un profil client est chargé
    login,
    logout,
    register,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* On n'affiche le reste de l'app que lorsque la vérification de session est terminée. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
