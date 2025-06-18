const express = require('express');
const router = express.Router();

const { getVehiculeStats, getVehiculeStatsBySuccursale } = require('../services/vehiculeService');
const { getSuccursaleCount, getAllSuccursales } = require('../services/succursaleService');
const { getReservationCountBySuccursale, getActiveReservationCount } = require('../services/reservationService');

router.get('/dashboard-data', async (req, res) => {
  try {
    // 1. Lancer tous les appels aux microservices en parallèle.
    const [
      vehiculesStatsData,
      succursaleCountData,
      activeReservationsData,
      vehiculesBySuccursaleData,
      allSuccursalesData,
      reservationCountBySuccData,
    ] = await Promise.all([
      getVehiculeStats(),
      getSuccursaleCount(),
      getActiveReservationCount(), // Appel à la nouvelle fonction
      getVehiculeStatsBySuccursale(),
      getAllSuccursales(),
      getReservationCountBySuccursale(),
    ]);

    // 2. Préparer le mapping des noms de succursales.
    const succursaleNameMap = allSuccursalesData.reduce((map, succursale) => {
      map[succursale.idsuccursale] = succursale.nomsuccursale;
      return map;
    }, {});

    // 3. Combiner les stats des véhicules avec les noms de succursales.
    const combinedVehiculesBySuccursale = vehiculesBySuccursaleData.map(stat => ({
      succursaleidsuccursale: stat.succursaleidsuccursale,
      vehiculeCount: parseInt(stat.vehiculeCount, 10),
      nomsuccursale: succursaleNameMap[stat.succursaleidsuccursale] || 'Succursale Inconnue'
    }));
    
    // 4. Préparer le top 3 des succursales par réservation.
    const topSuccursalesByReservation = reservationCountBySuccData
      .map(stat => ({
        nomsuccursale: succursaleNameMap[stat.idsuccursalelivraison] || 'Inconnue',
        count: parseInt(stat.reservationCount, 10),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // 5. Construire l'objet de réponse final qui sera envoyé au frontend.
    const finalResponse = {
      vehicules: vehiculesStatsData,
      succursales: succursaleCountData,
      // Ajout de la nouvelle statistique
      reservationsActives: activeReservationsData.count || 0, 
      vehiculesBySuccursale: combinedVehiculesBySuccursale,
      topSuccursalesByReservation: topSuccursalesByReservation,
      // la stat utilisateur sera ajoutée plus tard
    };

    res.json(finalResponse);

  } catch (error) {
    console.error('Erreur lors de la construction des données du dashboard:', error.message);
    res.status(503).json({
      error: 'Un ou plusieurs services nécessaires pour le dashboard ne sont pas disponibles.' 
    });
  }
});

module.exports = router;
