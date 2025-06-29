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

export const getMyBookings = async () => {
  try {
    // 1. On récupère le token depuis le localStorage.
    // C'est la même logique que vous utiliseriez pour d'autres appels authentifiés.
    const token = localStorage.getItem('accessToken');

    // 2. On vérifie si le token existe.
    if (!token) {
      // Si l'utilisateur n'est pas connecté, il ne peut pas avoir de réservations.
      // On peut soit renvoyer un tableau vide, soit lancer une erreur.
      throw new Error("Token d'authentification manquant.");
    }

    // 3. On fait l'appel API en ajoutant manuellement l'en-tête 'Authorization'.
    // Cela n'affecte aucune autre fonction de ce fichier.
    const response = await apiClient.get('/reservations/my-bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 4. On retourne les données.
    return response.data;

  } catch (error) {
    // On garde votre gestion d'erreur.
    console.error("Erreur API lors de la récupération de vos réservations:", error.message);
    // On propage l'erreur pour que le composant puisse l'afficher.
    throw error.response?.data || error;
  }
};

/**
 * Récupère les détails d'une réservation spécifique en utilisant axios.
 * @param {string|number} bookingId - L'ID de la réservation à récupérer.
 */
export const getBookingDetails = async (bookingId) => {
  try {
    // 1. On récupère le token du localStorage
    const token = localStorage.getItem('accessToken');

    // 2. On vérifie sa présence
    if (!token) {
      throw new Error("Token d'authentification manquant pour récupérer les détails.");
    }

    // 3. On fait l'appel avec axios (apiClient) en passant l'en-tête d'autorisation
    const response = await apiClient.get(`/reservations/my-bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 4. On retourne les données de la réponse
    return response.data;

  } catch (error) {
    // On utilise votre gestionnaire d'erreur existant
    handleError(error);
  }
};


/**
 * Initie le processus de paiement en appelant le backend.
 * @param {object} reservationData - Les données de la réservation (idvehicule, idclient, dates, etc.).
 * @returns {Promise<object>} La réponse du backend contenant le clientSecret de Stripe.
 */
export const initiateCheckout = async (reservationData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Vous devez être connecté pour initier une réservation.");
    }

    // ON APPELLE LA ROUTE CORRECTE : /reservations/initiate-checkout
    const response = await apiClient.post('/reservations/initiate-checkout', reservationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;

  } catch (error) {
    // La fonction handleError s'occupera de loguer l'erreur détaillée.
    handleError(error);
  }
};

/**
 * Finalise une réservation après un paiement réussi.
 * @param {object} finalizationData - Les données de finalisation (idintentstripe, reservationDetails).
 * @returns {Promise<object>} La réservation créée.
 */
export const finalizeReservation = async (finalizationData) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Vous devez être connecté pour finaliser une réservation.");
    }

    const response = await apiClient.post('/reservations/finalize', finalizationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;

  } catch (error) {
    handleError(error);
  }
};