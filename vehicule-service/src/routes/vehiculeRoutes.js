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
router.get('/filter-options', vehiculeController.getVehiculeFilterOptions);

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

router.delete("/:id", vehiculeController.deleteVehicule);

module.exports = router;
