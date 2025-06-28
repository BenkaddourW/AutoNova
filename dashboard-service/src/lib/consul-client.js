const Consul = require('consul');

// Initialisez le client Consul une seule fois
const consul = new Consul({ host: 'localhost', port: 8500, promisify: true });

/**
 * Trouve l'URL directe d'une instance de service saine via Consul.
 * @param {string} serviceName - Le nom du service à trouver (ex: 'vehicule-service').
 * @returns {Promise<string>} L'URL de base du service (ex: 'http://localhost:3002').
 */
async function getServiceUrl(serviceName) {
  try {
    const services = await consul.health.service({
      service: serviceName,
      passing: true, // Ne retourne que les instances saines
    });

    if (services.length === 0) {
      throw new Error(`Aucune instance saine trouvée pour le service: ${serviceName}`);
    }

    // Stratégie simple : on prend la première instance trouvée
    const service = services[0].Service;
    return `http://${service.Address}:${service.Port}`;

  } catch (error) {
    console.error(`Erreur Consul lors de la recherche du service '${serviceName}':`, error.message);
    throw error; // Propage l'erreur pour que l'appelant puisse la gérer
  }
}

module.exports = { getServiceUrl };
