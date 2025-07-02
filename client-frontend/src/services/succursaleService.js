// Fichier : src/services/succursaleService.js (Version Correcte)

import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';
const apiClient = axios.create({ baseURL: GATEWAY_URL });

const handleError = (error) => {
    console.error("Erreur API (Succursales):", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Une erreur réseau est survenue.");
};

/**
 * Récupère la liste des succursales avec des filtres (pour l'administration, etc.).
 */
export const getSuccursales = async (params = {}) => {
    try {
        const response = await apiClient.get('/succursales', { params });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Récupère une liste simplifiée des succursales (ID et nom) pour les menus déroulants.
 */
export const getSuccursaleNamesList = async () => {
    try {
        const response = await apiClient.get('/succursales/all-list');
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Récupère la liste unique des pays.
 */
export const getCountries = async () => {
    try {
        const response = await apiClient.get('/succursales/locations/countries');
        // La réponse du backend est déjà un tableau de chaînes, pas besoin de .data.data
        return response.data; 
    } catch (error) {
        handleError(error);
    }
};

/**
 * Récupère la liste unique des provinces pour un pays.
 */
export const getProvinces = async (country) => {
    try {
        const response = await apiClient.get(`/succursales/locations/provinces`, { params: { country } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

/**
 * Récupère la liste unique des villes pour une combinaison pays/province.
 */
export const getCities = async (country, province) => {
    try {
        const response = await apiClient.get(`/succursales/locations/cities`, { params: { country, province } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

// Récupère les succursales basées sur un pays, une province et une ville.


export const getSuccursalesByLocation = async (country, province, city) => {
    try {
        const response = await apiClient.get(`/succursales/locations/succursales`, { params: { country, province, city } });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};