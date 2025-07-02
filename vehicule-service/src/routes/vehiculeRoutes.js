const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehiculeController");

const validate = require("../middlewares/validate");
const {
  createVehiculeRules,
  updateVehiculeRules,
} = require("../validators/vehiculeValidator");

// --- Routes pour les statistiques ---
router.get("/stats/by-marque", vehiculeController.getVehiculeStatsByMarque);
router.get("/stats/general", vehiculeController.getVehiculeGeneralStats);
router.get(
  "/stats/by-succursale",
  vehiculeController.getVehiculeStatsBySuccursale
);
router.get("/filter-options", vehiculeController.getVehiculeFilterOptions);

// --- Routes personnalisées à placer avant /:id ---
router.get("/public-filter-options", vehiculeController.getPublicFilterOptions);
router.get("/search", vehiculeController.searchAvailableVehicles);
router.get("/disponibles", vehiculeController.getVehiculesDisponibles);
router.get("/featured", vehiculeController.getFeaturedVehicles); // <-- AJOUT

// --- Routes pour le CRUD ---
router.get("/", vehiculeController.getVehicules);
router.get("/:id", vehiculeController.getVehiculeById);

// Création d'un véhicule
router.post(
  "/",
  createVehiculeRules,
  validate,
  vehiculeController.createVehicule
);

// Mise à jour d'un véhicule
router.put(
  "/:id",
  updateVehiculeRules,
  validate,
  vehiculeController.updateVehicule
);

module.exports = router;
