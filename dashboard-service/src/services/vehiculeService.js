const axios = require('axios');
const { getServiceUrl } = require('../lib/consul-client'); // Utilitaire pour la découverte de services via Consul

/**
 * Récupère les statistiques globales du parc de véhicules via le vehicule-service.
 * @returns {Object} Statistiques agrégées : total, disponibles, en location, en maintenance, hors service.
 */
async function getVehiculeStats() {
  try {
    const baseUrl = await getServiceUrl('vehicule-service');
    const { data } = await axios.get(`${baseUrl}/vehicules/stats/general`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques véhicules :', error.message);
    return {
      total: 0,
      disponibles: 0,
      en_location: 0,
      en_maintenance: 0,
      hors_service: 0
    };
  }
}

/**
 * Récupère les statistiques de véhicules par succursale (données brutes, sans nom de succursale).
 * @returns {Array} Liste des succursales avec le nombre de véhicules associés.
 */
async function getVehiculeStatsBySuccursale() {
  try {
    const baseUrl = await getServiceUrl('vehicule-service');
    const { data } = await axios.get(`${baseUrl}/vehicules/stats/by-succursale`);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques véhicules par succursale :', error.message);
    return [];
  }
}

/**
 * Récupère les statistiques de véhicules par succursale, enrichies avec le nom de chaque succursale.
 * Utile pour l'affichage dans les graphiques (ex : BarChart).
 * @returns {Array} Liste des succursales avec leur nom et le nombre de véhicules.
 */
async function getVehiculeStatsBySuccursaleWithNames() {
  try {
    const vehiculeUrl = await getServiceUrl("vehicule-service");
    const succursaleUrl = await getServiceUrl("succursale-service");

    // Récupère en parallèle les stats par succursale et la liste des succursales
    const [statsRes, succursalesRes] = await Promise.all([
      axios.get(`${vehiculeUrl}/vehicules/stats/by-succursale`),
      axios.get(`${succursaleUrl}/succursales`)
    ]);

    const stats = statsRes.data;
    const succursales = succursalesRes.data;

    // Fusionne les données pour associer le nom à chaque succursale
    return stats.map(item => {
      const match = succursales.find(s => s.idsuccursale === item.succursaleidsuccursale);
      return {
        nomsuccursale: match ? match.nomsuccursale : `Succursale ${item.succursaleidsuccursale}`,
        count: Number.isNaN(parseInt(item.vehiculeCount)) ? 0 : parseInt(item.vehiculeCount)
      };
    });

  } catch (error) {
    console.error("Erreur lors de l'enrichissement des statistiques véhicules par succursale :", error);
    throw error;
  }
}

// Exports des fonctions utilisées par le dashboard
module.exports = {
  getVehiculeStats,
  getVehiculeStatsBySuccursale,
  getVehiculeStatsBySuccursaleWithNames
};

/*
Suggestions d'amélioration :
- Ajoutez une gestion de cache si les statistiques évoluent peu fréquemment pour améliorer les performances.
- Centralisez les messages d'erreur pour faciliter la maintenance et la traduction.
- Documentez chaque fonction dans une spécification OpenAPI/Swagger si ces services sont exposés en interne.
- Si la volumétrie devient importante, prévoyez une pagination côté vehicule-service pour les endpoints retournant des listes.
*/
