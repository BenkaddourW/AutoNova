// src/services/taxeService.js (Version Finale avec Axios et Centralisation)

import axios from 'axios';

// ✅ 1. UTILISER L'URL DE LA GATEWAY, pas une URL spécifique au service
const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

// ✅ 2. DÉFINIR le chemin de base pour ce service
const BASE_URL = `${GATEWAY_URL}/taxes`;

// Instance Axios (peut être partagée dans un fichier api.js si vous le souhaitez)
const apiClient = axios.create({
  baseURL: GATEWAY_URL,
});

// ✅ 3. CENTRALISER la gestion des erreurs
const handleError = (error) => {
  console.error("Erreur API (Taxes):", error.response?.data || error.message);
  // On propage une erreur plus simple à gérer pour le composant
  const err = new Error(error.response?.data?.message || "Une erreur réseau est survenue.");
  err.errors = error.response?.data?.errors; // On attache les erreurs de validation
  throw err;
};

// --- Fonctions du service ---

export const getTaxes = async (params = {}) => {
  try {
    const response = await apiClient.get('/taxes', { params });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getTaxeById = async (id) => {
  try {
    const response = await apiClient.get(`/taxes/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const createTaxe = async (data) => {
  try {
    // On appelle la route de base POST /taxes
    const response = await apiClient.post('/taxes', data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const updateTaxe = async (id, data) => {
  try {
    const response = await apiClient.put(`/taxes/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteTaxe = async (id) => {
  try {
    // La méthode delete ne retourne généralement pas de contenu
    await apiClient.delete(`/taxes/${id}`);
    return null; 
  } catch (error) {
    handleError(error);
  }
};

export const getTaxesByLocalite = async (pays, province) => {
  try {
    const response = await apiClient.get('/taxes/by-localite', { params: { pays, province } });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
