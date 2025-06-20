const express = require('express');
const router = express.Router();

// --- ÉTAPE 1 : IMPORTER LES BONNES FONCTIONS ---

// Pour les stats générales des véhicules (StatCard)
const { getVehiculeStats } = require('../services/vehiculeService');

// Pour le nombre total de succursales (StatCard)
const { getSuccursaleCount } = require('../services/succursaleService');

// Pour les données de réservation (StatCard, Widget, Graphique)
// On importe les fonctions dont le frontend a VRAIMENT besoin
const { 
  getActiveReservationCount,
  getRecentReservations,
  getMonthlyEvolution
} = require('../services/reservationService');


// --- ÉTAPE 2 : METTRE À JOUR LA ROUTE PRINCIPALE ---

router.get('/dashboard-data', async (req, res) => {
  try {
    // On lance en parallèle UNIQUEMENT les appels nécessaires pour la page d'accueil
    const [
      vehiculesStats,      // Pour la StatCard "Véhicules au total"
      succursaleCount,     // Pour la StatCard "Succursales"
      // activeReservations,  // Pour la StatCard "Réservations Actives"
      recentReservations,  // Pour le widget "Réservations Récentes"
      monthlyEvolution,    // Pour le graphique "Évolution Mensuelle"
    ] = await Promise.all([
      getVehiculeStats(),
      getSuccursaleCount(),
      getActiveReservationCount(),
      // getRecentReservations(),
      getMonthlyEvolution(),
    ]);

    // --- ÉTAPE 3 : CONSTRUIRE LA RÉPONSE FINALE ---
    // La structure de cet objet doit correspondre exactement à ce que le frontend attend.
    const finalResponse = {
      // Pour les StatCards
      vehicules: vehiculesStats, 
      succursales: succursaleCount,
      reservationsActives: activeReservations.count || 0,
      
      // Pour le widget de réservations
      recentReservations: recentReservations, 
      
      // Pour le graphique d'évolution
      monthlyEvolution: monthlyEvolution,
    };

    res.json(finalResponse);

  } catch (error) {
    // Cette erreur est attrapée si un des services n'est pas trouvable par Consul
    console.error('Erreur critique lors de la construction des données du dashboard:', error.message);
    res.status(503).json({
      error: 'Un ou plusieurs services nécessaires pour le dashboard ne sont pas disponibles.' 
    });
  }
});

module.exports = router;
