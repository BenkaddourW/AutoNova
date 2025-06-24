const express = require("express");
const router = express.Router();
const succursaleController = require("../controllers/succursaleController");
const validate = require("../middlewares/validate");
const { createSuccursaleRules, updateSuccursaleRules } = require("../validators/succursaleValidator");

// --- ROUTES POUR LA RECHERCHE DE LIEU STRUCTURÉE ---
router.get('/locations/countries', succursaleController.getDistinctCountries);
router.get('/locations/provinces', succursaleController.getDistinctProvinces);
router.get('/locations/cities', succursaleController.getDistinctCities);
router.get('/locations/succursales', succursaleController.getSuccursalesByLocation);

// --- ROUTES EXISTANTES ---
router.get('/all-list', succursaleController.getSuccursaleNamesList);
router.get('/count', succursaleController.getSuccursaleCount);
router.get('/next-code', succursaleController.getNextCode);
router.get('/find-ids', succursaleController.findSuccursaleIds);

// --- ROUTES CRUD ---
router.get("/", succursaleController.getSuccursales);
router.get("/:id", succursaleController.getSuccursaleById);
router.post("/", createSuccursaleRules, validate, succursaleController.createSuccursale);
router.put("/:id", updateSuccursaleRules, validate, succursaleController.updateSuccursale);

module.exports = router;