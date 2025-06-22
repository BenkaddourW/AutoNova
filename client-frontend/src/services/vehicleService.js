// src/services/vehicleService.js

import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';
const apiClient = axios.create({ baseURL: GATEWAY_URL });

const handleError = (error) => {
    console.error("Erreur API (Vehicles):", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Une erreur réseau est survenue.");
};

/**
 * Récupère la liste de tous les véhicules.
 * Le backend retourne un objet { total, vehicules }, on extrait la liste.
 */
export const getVehicles = async () => {
    try {
        const response = await apiClient.get('/vehicules');
        // --- CORRECTION IMPORTANTE ---
        // On retourne response.data.vehicules au lieu de response.data
        return response.data.vehicules; 
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