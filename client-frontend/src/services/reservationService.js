// src/services/reservationService.js

import axios from 'axios';

const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';
const apiClient = axios.create({ baseURL: GATEWAY_URL });

const handleError = (error) => {
    console.error("Erreur API (Reservations):", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Une erreur réseau est survenue.");
};

/**
 * Appelle l'endpoint pour vérifier la disponibilité des véhicules sur une période donnée.
 * @param {object} data - Doit contenir { idsvehicules: number[], datedebut: string, datefin: string }
 * @returns {Promise<object>} - Un objet avec la liste des ID de véhicules disponibles. Ex: { disponibles: [1, 3, 5] }
 */
export const checkAvailability = async (data) => {
    try {
        const response = await apiClient.post('/reservations/disponibilites', data);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
