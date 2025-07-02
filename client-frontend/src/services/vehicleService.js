// src/services/vehicleService.js

import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';
const apiClient = axios.create({ baseURL: GATEWAY_URL });

const handleError = (error) => {
    console.error("Erreur API (Vehicles):", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Une erreur réseau est survenue.");
};

/**
 * Récupère la liste des véhicules, potentiellement avec des filtres.
 * Le backend retourne un objet { total, vehicules }.
 * On renvoie l'objet entier pour que le composant puisse l'utiliser.
 * @param {object} params - Un objet de paramètres de requête (ex: { categorie: 'VUS', marque: 'Ford' })
 */
export const getVehicles = async (params = {}) => {
    try {
        const response = await apiClient.get('/vehicules', { params });
        // ✅ CORRECTION CLÉ : Renvoyer l'objet complet { total, vehicules }
        // et non pas seulement response.data.vehicules
        return response.data; 
    } catch (error) {
        handleError(error);
    }
};


// --- AJOUTEZ CETTE FONCTION ---
/**
 * Récupère les détails d'un seul véhicule par son ID.
 * @param {string|number} id - L'ID du véhicule à récupérer.
 */
export const getVehiculeById = async (id) => {
    try {
        // L'appel API utilise un template literal pour insérer l'ID dans l'URL
        const response = await apiClient.get(`/vehicules/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
/**
 * Récupère les détails d'un seul véhicule par son ID.
 * @param {string|number} id - L'ID du véhicule à récupérer.
 * @returns {Promise<object>} - L'objet du véhicule.
 */
export const getVehicleById = async (id) => {
    try {
        const response = await apiClient.get(`/vehicules/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};


export const getFilterOptions = async () => {
  try {
    // ✅ ON CHANGE L'URL ICI pour appeler la nouvelle route
    const response = await apiClient.get('/vehicules/public-filter-options');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};
/**
 * Appelle le nouvel endpoint de recherche agrégée du backend.
 * @param {object} params - Contient { location, datedebut, datefin }
 */
export const searchVehicles = async (params) => {
    try {
        const response = await apiClient.get('/vehicules/search', { params });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};


// NOUVELLE VERSION CORRIGÉE
export const getFeaturedVehicles = async () => { // <--- "Featured" correct
    try {
        const response = await apiClient.get('/vehicules/featured');
        return response.data;
    } catch (error) {
        handleError(error);
    }
};