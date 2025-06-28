const axios = require('axios');
const { getServiceUrl } = require('../lib/consul-client'); // Importer notre client Consul

// ✅ Statistiques générales des véhicules
async function getVehiculeStats() {
  try {
    const baseUrl = await getServiceUrl('vehicule-service');
    const { data } = await axios.get(`${baseUrl}/vehicules/stats/general`);
    return data;
  } catch (error) {
    console.error('Error fetching vehicule stats:', error.message);
    return {
      total: 0,
      disponibles: 0,
      en_location: 0,
      en_maintenance: 0,
      hors_service: 0
    };
  }
}

// ✅ Stats brutes par succursale (non utilisées pour le BarChart)
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

// ✅ Stats enrichies avec nom de succursale (pour BarChart)
async function getVehiculeStatsBySuccursaleWithNames() {
  try {
    const vehiculeUrl = await getServiceUrl("vehicule-service");
    const succursaleUrl = await getServiceUrl("succursale-service");

    console.log("📡 URL Véhicules :", vehiculeUrl);
    console.log("📡 URL Succursales :", succursaleUrl);

    const [statsRes, succursalesRes] = await Promise.all([
      axios.get(`${vehiculeUrl}/vehicules/stats/by-succursale`),
      axios.get(`${succursaleUrl}/succursales`)
    ]);

    const stats = statsRes.data;
    const succursales = succursalesRes.data;

    console.log("✅ Stats reçues :", stats);
    console.log("✅ Succursales reçues :", succursales);

 return stats.map(item => {
  const match = succursales.find(s => s.idsuccursale === item.succursaleidsuccursale);
  return {
    nomsuccursale: match ? match.nomsuccursale : `Succursale ${item.succursaleidsuccursale}`,
    count: Number.isNaN(parseInt(item.vehiculeCount)) ? 0 : parseInt(item.vehiculeCount)
  };
});

  } catch (error) {
    console.error("❌ Erreur dans getVehiculeStatsBySuccursaleWithNames :", error);
    throw error;
  }
}

// ✅ Exports
module.exports = {
  getVehiculeStats,
  getVehiculeStatsBySuccursale,
  getVehiculeStatsBySuccursaleWithNames
};
