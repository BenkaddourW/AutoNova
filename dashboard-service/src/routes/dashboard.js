const express = require('express');
const router = express.Router();

// ===============================
// IMPORT DES SERVICES NÉCESSAIRES
// ===============================

// Statistiques générales sur les véhicules (pour les StatCards)
const { getVehiculeStats, getVehiculeStatsBySuccursaleWithNames } = require('../services/vehiculeService');

// Nombre total de succursales (pour les StatCards)
const { getSuccursaleCount } = require('../services/succursaleService');

// Statistiques et données de réservation (pour StatCards, widgets, graphiques)
const { 
  getActiveReservationCount,
  getRecentReservations,
  getMonthlyEvolution,
  getTopSuccursalesByReservation,
} = require('../services/reservationService');

// ===============================
// ROUTES DU DASHBOARD
// ===============================

/**
 * Route principale pour récupérer toutes les données nécessaires à l'affichage du dashboard.
 * Les appels aux différents services sont effectués en parallèle pour optimiser les performances.
 * La structure de la réponse doit correspondre aux attentes du frontend.
 */
router.get('/dashboard-data', async (req, res) => {
  try {
    // Exécution parallèle des appels aux services nécessaires pour la page d'accueil du dashboard
    const [
      vehiculesStats,      // Statistiques globales sur les véhicules
      succursaleCount,     // Nombre total de succursales
      activeReservations,  // Nombre de réservations actives
      recentReservations,  // Réservations récentes (widget)
      monthlyEvolution,    // Évolution mensuelle des réservations
      topSuccursalesData,  // Succursales les plus performantes
    ] = await Promise.all([
      getVehiculeStats(),
      getSuccursaleCount(),
      getActiveReservationCount(),
      getRecentReservations(),
      getMonthlyEvolution(),
      getTopSuccursalesByReservation(),
    ]);

    // Construction de la réponse structurée pour le frontend
    const finalResponse = {
      vehicules: vehiculesStats,
      succursales: succursaleCount,
      reservationsActives: activeReservations.count || 0,
      recentReservations: recentReservations,
      monthlyEvolution: monthlyEvolution,
      topSuccursalesByReservation: topSuccursalesData
    };

    res.json(finalResponse);

  } catch (error) {
    // Gestion des erreurs critiques (ex : service indisponible)
    console.error('Erreur critique lors de la construction des données du dashboard:', error.message);
    res.status(503).json({
      error: 'Un ou plusieurs services nécessaires pour le dashboard ne sont pas disponibles.' 
    });
  }
});

/**
 * Retourne les statistiques de véhicules par succursale (avec noms).
 */
router.get('/vehicules-by-succursale', async (req, res) => {
  try {
    const result = await getVehiculeStatsBySuccursaleWithNames();
    res.json(result);
  } catch (error) {
    console.error("Erreur route /vehicules-by-succursale :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * Retourne les succursales ayant le plus grand nombre de réservations.
 */
router.get('/top-succursales', async (req, res) => {
  try {
    const topSuccursales = await getTopSuccursalesByReservation();
    res.json(topSuccursales);
  } catch (error) {
    console.error("Erreur route /top-succursales :", error.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
