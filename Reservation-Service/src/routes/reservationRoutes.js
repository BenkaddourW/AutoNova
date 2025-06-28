const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const {
  createReservationRules,
  updateReservationRules,
} = require("../validators/reservationValidator");
const validate = require("../middlewares/validate");

// --- Routes pour les statistiques du Dashboard ---
router.get(
  "/stats/by-succursale",
  reservationController.getReservationCountBySuccursale
);
router.get(
  "/stats/monthly-evolution",
  reservationController.getMonthlyEvolution
);
router.get(
  "/stats/active-count",
  reservationController.getActiveReservationsCount
); // Route harmonisée
router.get("/recent", reservationController.getRecentReservations);

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

router.get(
  "/:id/full-details",
  reservationController.getReservationFullDetails
);

// Vérifier la disponibilité d'une liste de véhicules
router.post("/disponibilites", reservationController.getDisponibilites);

module.exports = router;
