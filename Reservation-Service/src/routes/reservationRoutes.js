/**
 * Définition des routes de réservation
 * ------------------------------------
 * Ce fichier centralise la déclaration des routes liées aux réservations.
 * Certaines routes sont protégées par des middlewares d'authentification et d'autorisation.
 */

const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

console.log(
  "DEBUG: reservationController.getTopReservedVehicles =",
  typeof reservationController.getTopReservedVehicles
);

const {
  createReservationRules,
  updateReservationRules,
} = require("../validators/reservationValidator");
const validate = require("../middlewares/validate");
const authorizeRole = require("../middlewares/authorizeRole");
const authenticateToken = require("../middlewares/authMiddleware"); // <-- Correction ici
console.log("DEBUG authorizeRole:", typeof authorizeRole);
console.log(
  "DEBUG getMyReservationById:",
  typeof reservationController.getMyReservationById
);

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
);
router.get(
  "/stats/top-succursales",
  reservationController.getTopSuccursalesByReservation
);
router.get("/recent", reservationController.getRecentReservations);
router.get("/stats/top-vehicles", reservationController.getTopReservedVehicles);

// --- Routes pour les réservations de l'utilisateur connecté ---
router.get(
  "/my-bookings",
  authenticateToken,
  reservationController.getMyReservations
);
router.get(
  "/my-bookings/:id",
  authenticateToken,
  reservationController.getMyReservationById
);

// --- Routes pour le processus de paiement ---
router.post("/initiate-checkout", reservationController.initiateCheckout);
router.post("/finalize", reservationController.finalizeReservation);

// --- Vérifier la disponibilité d'une liste de véhicules ---
router.post("/disponibilites", reservationController.getDisponibilites);

// --- Routes CRUD classiques ---
router.get("/", reservationController.getReservations);
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

// --- Routes dynamiques à placer en dernier ---
router.get(
  "/:id/full-details",
  authenticateToken,
  authorizeRole("admin", "employe"),
  reservationController.getReservationFullDetails
);

router.patch(
  "/:id/statut",
  authenticateToken,
  authorizeRole("admin", "employe"),
  reservationController.majStatutReservation
);

// CETTE ROUTE DOIT ÊTRE LA DERNIÈRE
router.get("/:id", reservationController.getReservationById);

console.log(
  "DEBUG getTopReservedVehicles:",
  typeof reservationController.getTopReservedVehicles
);

module.exports = router;
