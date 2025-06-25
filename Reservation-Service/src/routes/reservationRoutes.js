const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const {
  createReservationRules,
  updateReservationRules,
} = require('../validators/reservationValidator');

const validate = require("../middlewares/validate");

router.get('/stats/top-succursales', reservationController.getTopSuccursalesByReservation);

// --- Routes pour les statistiques du Dashboard ---
router.get('/stats/top-vehicles', reservationController.getTopReservedVehicles);
router.get('/stats/top-ids', reservationController.getTopReservedVehicles); // Utilisé par vehicule-service

router.get('/recent', reservationController.getRecentReservations);
router.get('/stats/by-succursale', reservationController.getReservationCountBySuccursale);
router.get('/stats/monthly-evolution', reservationController.getMonthlyEvolution);
router.get('/stats/active-count', reservationController.getActiveReservationsCount); // Route harmonisée


// --- Routes CRUD classiques ---
router.get("/", reservationController.getReservations);
router.get("/:id", reservationController.getReservationById);

router.post(
  "/",
  createReservationRules,
  validate,
  reservationController.createReservation
);

router.put(
  "/:id",
  updateReservationRules,
  validate,
  reservationController.updateReservation
);

router.delete("/:id", reservationController.deleteReservation);
// Vérifier la disponibilité d'une liste de véhicules
router.post("/disponibilites", reservationController.getDisponibilites);

module.exports = router;
