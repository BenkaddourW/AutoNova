/**
 * Routes Véhicule
 * ---------------
 * Définit toutes les routes HTTP liées à la gestion des véhicules.
 * Chaque route est associée à une méthode du contrôleur correspondant.
 * Certaines routes utilisent des middlewares de validation pour garantir l'intégrité des données.
 */

const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehiculeController");

const validate = require("../middlewares/validate");
const {
  createVehiculeRules,
  updateVehiculeRules,
} = require("../validators/vehiculeValidator");

// --- Statistiques véhicules ---
router.get('/stats/by-marque', vehiculeController.getVehiculeStatsByMarque);         // Statistiques par marque (top 5)
router.get('/stats/general', vehiculeController.getVehiculeGeneralStats);            // Statistiques globales
router.get('/stats/by-succursale', vehiculeController.getVehiculeStatsBySuccursale); // Statistiques par succursale

// --- Options de filtres pour le site public ---
router.get('/public-filter-options', vehiculeController.getPublicFilterOptions);      // Filtres pour la recherche publique

// --- Options de filtres pour l'administration ---
router.get('/filter-options', vehiculeController.getVehiculeFilterOptions);           // Filtres pour l'admin

// --- Recherche de véhicules disponibles ---
router.get('/search', vehiculeController.searchAvailableVehicles);                    // Recherche avancée de véhicules

// --- Véhicules en vedette ---
router.get('/featured', vehiculeController.getFeaturedVehicles);                      // Véhicules populaires/vedettes

// --- CRUD Véhicule ---
router.get("/", vehiculeController.getVehicules);                                    // Liste tous les véhicules
router.get("/:id", vehiculeController.getVehiculeById);                              // Détail d'un véhicule par ID

// Création d'un véhicule (avec validation)
router.post(
  "/",
  createVehiculeRules,  // Règles de validation pour la création
  validate,             // Middleware de validation
  vehiculeController.createVehicule
);

// Mise à jour d'un véhicule (avec validation)
router.put(
  "/:id",
  updateVehiculeRules,  // Règles de validation pour la mise à jour
  validate,             // Middleware de validation
  vehiculeController.updateVehicule
);

module.exports = router;
