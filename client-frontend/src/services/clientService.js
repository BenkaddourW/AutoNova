// src/services/clientService.js

import axios from 'axios';

// L'URL de votre gateway
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

// Instance d'Axios avec l'URL de base
const apiClient = axios.create({
  baseURL: GATEWAY_URL,
});

// Intercepteur pour ajouter le token JWT à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fonction unifiée pour gérer les erreurs
const handleError = (error) => {
    console.error("Erreur API:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Une erreur réseau est survenue.");
};

// --- Fonctions inchangées ---
export const getMyProfile = async () => {
  try {
    const response = await apiClient.get('/clients/me');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
        return null;
    }
    handleError(error);
  }
};

export const createProfile = async (profileData) => {
  try {
    const response = await apiClient.post('/clients', profileData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// --- NOUVELLE FONCTION `updateMyProfile` SIMPLIFIÉE ---
/**
 * Met à jour le profil complet du client via un seul appel au microservice client.
 * Le service client se chargera ensuite de communiquer avec le service d'authentification.
 * @param {object} profileData - L'objet complet contenant toutes les données du formulaire.
 */
export const updateMyProfile = async (profileData) => {
  try {
    // Un seul appel PUT vers la route /clients/me.
    // On envoie l'intégralité des données du formulaire. Le backend s'occupe de la répartition.
    // L'idutilisateur n'est plus nécessaire en paramètre, car le backend l'extrait du token JWT.
    const response = await apiClient.put('/clients/me', profileData);
    
    // On retourne la réponse, qui devrait contenir le profil mis à jour.
    return response.data;
  } catch (error) {
    // La gestion d'erreur reste la même.
    handleError(error);
  }
};