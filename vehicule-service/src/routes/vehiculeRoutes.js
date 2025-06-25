const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehiculeController");

const validate = require("../middlewares/validate");
const {
  createVehiculeRules,
  updateVehiculeRules,
} = require("../validators/vehiculeValidator");



// --- Routes pour les statistiques ---
router.get('/stats/by-marque', vehiculeController.getVehiculeStatsByMarque);
router.get('/stats/general', vehiculeController.getVehiculeGeneralStats);
router.get('/stats/by-succursale', vehiculeController.getVehiculeStatsBySuccursale);

// --- Routes pour les options de filtre publiques ---
router.get('/public-filter-options', vehiculeController.getPublicFilterOptions);

// --- Routes pour les options de filtre ---admin
router.get('/filter-options', vehiculeController.getVehiculeFilterOptions);

router.get('/search', vehiculeController.searchAvailableVehicles);


router.get('/featured', vehiculeController.getFeaturedVehicles);

// Routes pour la recherche de véhicules

// --- Routes pour le CRUD ---
router.get("/", vehiculeController.getVehicules);
router.get("/:id", vehiculeController.getVehiculeById);

// Routes avec validation correcte
router.post(
  "/",
  createVehiculeRules,  // Utilisez directement createVehiculeRules
  validate,
  vehiculeController.createVehicule
);

router.put(
  "/:id",
  updateVehiculeRules,  // Utilisez directement updateVehiculeRules
  validate,
  vehiculeController.updateVehicule
);



module.exports = router;
