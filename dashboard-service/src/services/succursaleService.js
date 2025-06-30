const axios = require('axios');
// Import de la fonction utilitaire pour la découverte de services via Consul
const { getServiceUrl } = require('../lib/consul-client');

// NOTE : La variable d'environnement `baseURL` a été supprimée au profit de la découverte dynamique via Consul.

/**
 * Récupère le nombre total de succursales via le succursale-service.
 * Utilise la découverte de service pour obtenir dynamiquement l'URL du service cible.
 * @returns {Object} Objet contenant la clé "count" (nombre total de succursales)
 */
async function getSuccursaleCount() {
  try {
    // Découvre dynamiquement l'URL du succursale-service (nom enregistré dans Consul)
    const baseUrl = await getServiceUrl('succursale-service');

    // Appelle l'endpoint interne du service pour obtenir le nombre de succursales
    const { data } = await axios.get(`${baseUrl}/succursales/count`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de succursales :', error.message);
    return { count: 0 }; // Retourne un objet cohérent même en cas d'erreur
  }
}

/**
 * Récupère la liste complète des succursales via le succursale-service.
 * Utilise la découverte de service pour obtenir dynamiquement l'URL du service cible.
 * @returns {Array} Tableau des succursales (chaque élément contient les informations d'une succursale)
 */
async function getAllSuccursales() {
  try {
    // Découvre dynamiquement l'URL du succursale-service à chaque appel pour garantir la résilience
    const baseUrl = await getServiceUrl('succursale-service');
    
    // Appelle l'endpoint interne du service pour obtenir la liste des succursales
    const { data } = await axios.get(`${baseUrl}/succursales`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste des succursales :', error.message);
    return [];
  }
}

module.exports = { getSuccursaleCount, getAllSuccursales };

/*
Suggestions d'amélioration :
- Ajoutez une gestion de cache si la liste des succursales ou leur nombre change peu fréquemment.
- Centralisez les messages d'erreur pour faciliter la maintenance et la traduction.
- Documentez chaque fonction dans une spécification OpenAPI/Swagger si ces services sont exposés en interne.
- Si la volumétrie devient importante, prévoyez une pagination côté succursale-service et dans cette
*/

