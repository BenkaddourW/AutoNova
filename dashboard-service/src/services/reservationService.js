const axios = require('axios');

const RESERVATION_API_URL = process.env.RESERVATION_SERVICE_URL;

if (!RESERVATION_API_URL) {
  throw new Error("Erreur de configuration: RESERVATION_SERVICE_URL n'est pas défini dans le .env du dashboard-service.");
}

/**
 * Appelle le microservice pour obtenir le compte de réservations par succursale.
 */
async function getReservationCountBySuccursale() {
  try {
    const { data } = await axios.get(`${RESERVATION_API_URL}/reservations/stats/by-succursale`);
    return data;
  } catch (error) {
    console.error('Erreur de communication avec le reservation-service (by-succursale):', error.message);
    return []; 
  }
}

/**
 * Appelle le reservation-service pour obtenir le nombre de réservations actives.
 */
async function getActiveReservationCount() {
  try {
    // Appel à la route harmonisée
    const { data } = await axios.get(`${RESERVATION_API_URL}/reservations/stats/active-count`);
    return data; // Devrait retourner { count: X }
  } catch (error) {
    console.error('Erreur de com. avec reservation-service (active-count):', error.message);
    return { count: 0 }; // Valeur par défaut en cas d'erreur
  }
}

module.exports = { 
  getReservationCountBySuccursale,
  getActiveReservationCount 
};
