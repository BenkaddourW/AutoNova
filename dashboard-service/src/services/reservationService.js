// Fichier : services/reservationService.js

const axios = require("axios");
const { getServiceUrl } = require("../lib/consul-client");

// --- FONCTIONS EXISTANTES (INCHANGÉES) ---

async function getReservationCountBySuccursale() {
  try {
    const baseUrl = await getServiceUrl("reservation-service");
    const { data } = await axios.get(
      `${baseUrl}/reservations/stats/by-succursale`
    );
    return data;
  } catch (error) {
    console.error(
      "Erreur de com. avec reservation-service (by-succursale):",
      error.message
    );
    throw error; // Propage l'erreur pour que Promise.all échoue
  }
}

async function getActiveReservationCount() {
  try {
    const baseUrl = await getServiceUrl("reservation-service");
    const { data } = await axios.get(
      `${baseUrl}/reservations/stats/active-count`
    );
    return data;
  } catch (error) {
    console.error(
      "Erreur de com. avec reservation-service (active-count):",
      error.message
    );
    throw error;
  }
}

// --- FONCTIONS MANQUANTES À AJOUTER ---

/**
 * Appelle le reservation-service pour obtenir les 5 réservations les plus récentes.
 */
// async function getRecentReservations() {
//   try {
//     const baseUrl = await getServiceUrl('reservation-service');
//     // La route doit correspondre à celle définie dans reservationRoutes.js
//     const { data } = await axios.get(`${baseUrl}/reservations/stats/recent`);
//     return data;
//   } catch (error) {
//     console.error('Erreur de com. avec reservation-service (recent):', error.message);
//     throw error;
//   }
// }

/**
 * Appelle le reservation-service pour obtenir l'évolution mensuelle.
 */
async function getMonthlyEvolution() {
  try {
    const baseUrl = await getServiceUrl("reservation-service");
    const { data } = await axios.get(
      `${baseUrl}/reservations/stats/monthly-evolution`
    );
    return data;
  } catch (error) {
    console.error(
      "Erreur de com. avec reservation-service (monthly-evolution):",
      error.message
    );
    throw error;
  }
}

// --- ✅ NOUVEAU : Appel pour top succursales par réservation ---
async function getTopSuccursalesByReservation() {
  try {
    const reservationUrl = await getServiceUrl("reservation-service");
    const succursaleUrl = await getServiceUrl("succursale-service");

    // 1. Récupère les 3 meilleures succursales selon le nombre de réservations
    const { data: topRaw } = await axios.get(
      `${reservationUrl}/reservations/stats/top-succursales`
    );
    console.log("Réponse brute topRaw:", topRaw);
    // 2. Récupère la liste complète des succursales avec noms
    const { data: succursales } = await axios.get(
      `${succursaleUrl}/succursales/all-list`
    );

    // 3. Fusionne pour obtenir le nom de chaque succursale dans le top
    const topFinal = topRaw.map((row) => {
      const match = succursales.find(
        (s) => s.idsuccursale === row.idsuccursalelivraison
      );
      return {
        ...row,
        nomsuccursale:
          match?.nomsuccursale || `Succursale ${row.idsuccursalelivraison}`,
      };
    });

    return topFinal;
  } catch (error) {
    console.error("Erreur top succursales:", error.message);
    return [];
  }
}

// --- MISE À JOUR DE L'EXPORT ---
// Assurez-vous d'exporter TOUTES les fonctions que vous utilisez.
module.exports = {
  getReservationCountBySuccursale,
  getActiveReservationCount,
  // getRecentReservations,      // <--- AJOUTÉ
  getMonthlyEvolution,
  getTopSuccursalesByReservation, // <--- AJOUTÉ
};
