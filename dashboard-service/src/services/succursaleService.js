const axios = require('axios');
// Étape 1: Importer la fonction pour découvrir les services via Consul
const { getServiceUrl } = require('../lib/consul-client');

// NOTE: La variable `baseURL` provenant du .env a été supprimée.

async function getSuccursaleCount() {
  try {
    // Étape 2: Découvrir l'URL directe du succursale-service
    // Le nom 'succursale-service' doit correspondre à celui enregistré dans Consul.
    const baseUrl = await getServiceUrl('succursale-service');

    // Étape 3: Appeler l'endpoint INTERNE du service (avec son préfixe /api)
    const { data } = await axios.get(`${baseUrl}/succursales/count`);
    return data;
  } catch (error) {
    console.error('Error fetching succursale count:', error.message);
    return { count: 0 }; // Retourner un objet avec "count" pour la cohérence
  }
}

async function getAllSuccursales() {
  try {
    // Idem: Découvrir l'URL à chaque appel pour la résilience
    const baseUrl = await getServiceUrl('succursale-service');
    
    // Appeler la route de base INTERNE du service
    const { data } = await axios.get(`${baseUrl}/succursales`);
    return data;
  } catch (error) {
    console.error('Error fetching all succursales:', error.message);
    return [];
  }
}

module.exports = { getSuccursaleCount, getAllSuccursales };

