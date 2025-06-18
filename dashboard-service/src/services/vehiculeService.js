const axios = require('axios');

const baseURL = process.env.VEHICULE_SERVICE_URL;

async function getVehiculeStats() {
  try {
    // On appelle notre nouvel endpoint de statistiques générales
    const { data } = await axios.get(`${baseURL}/vehicules/stats/general`);
    return data;
  } catch (error) {
    console.error('Error fetching vehicule stats:', error.message);
    // Retourner un objet par défaut complet en cas d'erreur
    return {
      total: 0,
      disponibles: 0,
      en_location: 0,
      en_maintenance: 0,
      hors_service: 0,
    };
  }
}

// Nouvelle fonction pour obtenir les stats par succursale
async function getVehiculeStatsBySuccursale() {
  try {
    const { data } = await axios.get(`${baseURL}/vehicules/stats/by-succursale`);
    return data;
  } catch (error) {
    console.error('Error fetching vehicule stats by succursale:', error.message);
    return [];
  }
}

module.exports = { getVehiculeStats, getVehiculeStatsBySuccursale };