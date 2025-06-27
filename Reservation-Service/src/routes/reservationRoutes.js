/**
 * Définition des routes Reservation
 * ---------------------------------
 * Route toutes les requêtes liées aux réservations vers le contrôleur approprié.
 * Protège certaines routes avec le middleware d'authentification.
 */

const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const {
  createReservationRules,
  updateReservationRules,
} = require('../validators/reservationValidator');
const { protect } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validate");


// --- NOUVELLES ROUTES POUR LE FLUX DE PAIEMENT ---
router.post("/initiate-checkout", reservationController.initiateCheckout);
router.post("/finalize", reservationController.finalizeReservation);

router.get('/stats/top-succursales', reservationController.getTopSuccursalesByReservation);

// --- Routes pour les statistiques du Dashboard ---
router.get('/stats/top-vehicles', reservationController.getTopReservedVehicles);
router.get('/stats/top-ids', reservationController.getTopReservedVehicles); // Utilisé par vehicule-service

router.get('/recent', reservationController.getRecentReservations);
router.get('/stats/by-succursale', reservationController.getReservationCountBySuccursale);
router.get('/stats/monthly-evolution', reservationController.getMonthlyEvolution);
router.get('/stats/active-count', reservationController.getActiveReservationsCount); // Route harmonisée

// Récupérer les réservations de l'utilisateur connecté
router.get("/my-bookings", protect, reservationController.getMyReservations);
router.get("/my-bookings/:id", protect, reservationController.getMyReservationById);
// --- Routes CRUD classiques ---
router.get("/", reservationController.getReservations); // Liste toutes les réservations
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
