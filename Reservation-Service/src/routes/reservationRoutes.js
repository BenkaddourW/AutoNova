/**
 * Définition des routes de réservation
 * ------------------------------------
 * Ce fichier centralise la déclaration des routes liées aux réservations.
 * Certaines routes sont protégées par des middlewares d'authentification et d'autorisation.
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
const authorizeRole = require("../middlewares/authorizeRole");

// --- Routes pour le processus de paiement ---
router.post("/initiate-checkout", reservationController.initiateCheckout);
router.post("/finalize", reservationController.finalizeReservation);

// --- Routes statistiques pour le dashboard ---
router.get('/stats/top-succursales', reservationController.getTopSuccursalesByReservation);
router.get('/stats/top-vehicles', reservationController.getTopReservedVehicles);
router.get('/stats/top-ids', reservationController.getTopReservedVehicles); // Utilisé par le service véhicule
router.get('/recent', reservationController.getRecentReservations);
router.get('/stats/by-succursale', reservationController.getReservationCountBySuccursale);
router.get('/stats/monthly-evolution', reservationController.getMonthlyEvolution);
router.get('/stats/active-count', reservationController.getActiveReservationsCount);

// --- Routes pour les réservations de l'utilisateur connecté ---
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

// Récupère une réservation enrichie avec toutes ses dépendances (client, véhicule, succursales, etc.)
router.get(
  "/:id/full-details",
  protect, // Middleware d'authentification
  authorizeRole("admin", "employe"), // Middleware d'autorisation par rôle
  reservationController.getReservationFullDetails
);

// Met à jour uniquement le statut d'une réservation existante
router.patch(
  "/:id/statut",
  protect, // Middleware d'authentification
  authorizeRole("admin", "employe"), // Middleware d'autorisation par rôle
  reservationController.majStatutReservation
);

// Vérifie la disponibilité d'une liste de véhicules pour une période donnée
router.post("/disponibilites", reservationController.getDisponibilites);

module.exports = router;
