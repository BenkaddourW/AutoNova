const express = require("express");
const router = express.Router();
const succursaleController = require("../controllers/succursaleController");
const validate = require("../middlewares/validate");
const { createSuccursaleRules, updateSuccursaleRules } = require("../validators/succursaleValidator");

// --- ROUTES POUR LA RECHERCHE STRUCTURÉE DE LOCALISATION ---
// Permettent de récupérer des listes distinctes pour alimenter des filtres ou des formulaires dynamiques.
router.get('/locations/countries', succursaleController.getDistinctCountries);   // Liste des pays distincts
router.get('/locations/provinces', succursaleController.getDistinctProvinces);   // Liste des provinces distinctes pour un pays donné
router.get('/locations/cities', succursaleController.getDistinctCities);         // Liste des villes distinctes pour un pays et une province donnés
router.get('/locations/succursales', succursaleController.getSuccursalesByLocation); // Liste des succursales pour une localisation précise

// --- ROUTES DE CONSULTATION GLOBALE ET UTILITAIRES ---
// Fournissent des informations globales ou utilitaires sur les succursales.
router.get('/all-list', succursaleController.getSuccursaleNamesList); // Liste complète des noms de succursales
router.get('/count', succursaleController.getSuccursaleCount);        // Nombre total de succursales
router.get('/next-code', succursaleController.getNextCode);           // Prochain code disponible pour une nouvelle succursale
router.get('/find-ids', succursaleController.findSuccursaleIds);      // Recherche d'identifiants de succursales selon des critères

// --- ROUTES CRUD ---
// Opérations de gestion standard sur les succursales.
router.get("/", succursaleController.getSuccursales);                                         // Liste toutes les succursales
router.get("/:id", succursaleController.getSuccursaleById);                                   // Récupère une succursale par son identifiant
router.post("/", createSuccursaleRules, validate, succursaleController.createSuccursale);     // Crée une nouvelle succursale avec validation
router.put("/:id", updateSuccursaleRules, validate, succursaleController.updateSuccursale);   // Met à jour une succursale existante avec validation

module.exports = router;