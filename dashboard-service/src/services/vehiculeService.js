const axios = require('axios');
const { getServiceUrl } = require('../lib/consul-client'); // Importer notre client Consul

// Notez que les fonctions deviennent `async`
async function getVehiculeStats() {
  try {
    // 1. Obtenir l'URL directe du service via Consul
    const baseUrl = await getServiceUrl('vehicule-service');
    
    // 2. Appeler le service sur son chemin INTERNE, pas le chemin de la gateway
    const { data } = await axios.get(`${baseUrl}/vehicules/stats/general`);
    return data;

  } catch (error) {
    console.error('Error fetching vehicule stats:', error.message);
    return { total: 0, disponibles: 0, en_location: 0, en_maintenance: 0, hors_service: 0 };
  }
}

async function getVehiculeStatsBySuccursale() {
  try {
    const baseUrl = await getServiceUrl('vehicule-service');
    const { data } = await axios.get(`${baseUrl}/vehicules/stats/by-succursale`);
    return data;

  } catch (error) {
    console.error('Error fetching vehicule stats by succursale:', error.message);
    return [];
  }
}

module.exports = { getVehiculeStats, getVehiculeStatsBySuccursale };