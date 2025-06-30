// Fichier : services/reservationService.js

const axios = require('axios');
const { getServiceUrl } = require('../lib/consul-client');

// ===============================
// FONCTIONS DE RÉCUPÉRATION DE STATISTIQUES RÉSERVATION
// ===============================

/**
 * Récupère le nombre de réservations par succursale via le reservation-service.
 * @returns {Array} Liste des succursales avec leur nombre de réservations.
 */
async function getReservationCountBySuccursale() {
  try {
    const baseUrl = await getServiceUrl('reservation-service');
    const { data } = await axios.get(`${baseUrl}/reservations/stats/by-succursale`);
    return data;
  } catch (error) {
    console.error('Erreur de communication avec reservation-service (by-succursale) :', error.message);
    throw error; // Propage l'erreur pour que Promise.all échoue
  }
}

/**
 * Récupère le nombre de réservations actives via le reservation-service.
 * @returns {Object} Objet contenant le nombre de réservations actives.
 */
async function getActiveReservationCount() {
  try {
    const baseUrl = await getServiceUrl('reservation-service');
    const { data } = await axios.get(`${baseUrl}/reservations/stats/active-count`);
    return data;
  } catch (error) {
    console.error('Erreur de communication avec reservation-service (active-count) :', error.message);
    throw error;
  }
}

/**
 * Récupère l'évolution mensuelle des réservations via le reservation-service.
 * @returns {Array} Données d'évolution mensuelle des réservations.
 */
async function getMonthlyEvolution() {
  try {
    const baseUrl = await getServiceUrl('reservation-service');
    const { data } = await axios.get(`${baseUrl}/reservations/stats/monthly-evolution`);
    return data;
  } catch (error) {
    console.error('Erreur de communication avec reservation-service (monthly-evolution) :', error.message);
    throw error;
  }
}

/**
 * Récupère les 3 succursales ayant le plus grand nombre de réservations, puis enrichit avec leur nom.
 * @returns {Array} Liste des succursales les plus performantes avec leur nom et nombre de réservations.
 */
async function getTopSuccursalesByReservation() {
  try {
    const reservationUrl = await getServiceUrl('reservation-service');
    const succursaleUrl = await getServiceUrl('succursale-service');

    // 1. Récupère les 3 meilleures succursales selon le nombre de réservations
    const { data: topRaw } = await axios.get(`${reservationUrl}/reservations/stats/top-succursales`);

    // 2. Récupère la liste complète des succursales avec leurs noms
    const { data: succursales } = await axios.get(`${succursaleUrl}/succursales/all-list`);

    // 3. Fusionne pour obtenir le nom de chaque succursale dans le top
    const topFinal = topRaw.map(row => {
      const match = succursales.find(s => s.idsuccursale === row.idsuccursalelivraison);
      return {
        ...row,
        nomsuccursale: match?.nomsuccursale || `Succursale ${row.idsuccursalelivraison}`
      };
    });

    return topFinal;
  } catch (error) {
    console.error("Erreur lors de la récupération des top succursales :", error.message);
    return [];
  }
}

// ===============================
// EXPORT DES FONCTIONS UTILISÉES PAR LE ROUTEUR DASHBOARD
// ===============================
module.exports = { 
  getReservationCountBySuccursale,
  getActiveReservationCount,
  // getRecentReservations, // À décommenter si la fonction est implémentée
  getMonthlyEvolution,
  getTopSuccursalesByReservation,
};

/*
Suggestions d'amélioration :
- Implémentez et exportez la fonction getRecentReservations si elle est utilisée côté dashboard.
- Centralisez les messages d'erreur pour faciliter la maintenance et la traduction.
- Ajoutez une gestion de cache si les statistiques sont coûteuses à récupérer et peu volatiles.
- Documentez chaque fonction dans une spécification OpenAPI/Swagger si ces statistiques sont utilisées dans une API.
*/