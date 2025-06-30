/**
 * Définition des routes du service Véhicule
 * -----------------------------------------
 * Ce fichier regroupe l'ensemble des routes HTTP relatives à la gestion des véhicules.
 * Chaque route est associée à une méthode du contrôleur correspondant.
 * Certains endpoints intègrent des middlewares de validation afin de garantir l'intégrité des données reçues.
 */

const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehiculeController");

const validate = require("../middlewares/validate");
const {
  createVehiculeRules,
  updateVehiculeRules,
} = require("../validators/vehiculeValidator");

// --- Routes statistiques sur les véhicules ---
router.get('/stats/by-marque', vehiculeController.getVehiculeStatsByMarque);         // Statistiques des véhicules par marque (top 5)
router.get('/stats/general', vehiculeController.getVehiculeGeneralStats);            // Statistiques globales sur le parc automobile
router.get('/stats/by-succursale', vehiculeController.getVehiculeStatsBySuccursale); // Statistiques des véhicules par succursale

// --- Options de filtres pour la recherche publique ---
router.get('/public-filter-options', vehiculeController.getPublicFilterOptions);      // Récupère les options de filtre pour la recherche publique

// --- Options de filtres pour l'administration ---
router.get('/filter-options', vehiculeController.getVehiculeFilterOptions);           // Récupère les options de filtre pour l'administration

// --- Recherche de véhicules disponibles (site public) ---
router.get('/search', vehiculeController.searchAvailableVehicles);                    // Recherche simple de véhicules disponibles

// --- Recherche avancée de véhicules disponibles ---
router.get("/disponibles", vehiculeController.getVehiculesDisponibles);               // Recherche avancée de véhicules disponibles

// --- Véhicules en vedette ---
router.get('/featured', vehiculeController.getFeaturedVehicles);                      // Récupère la liste des véhicules mis en avant

// --- Routes CRUD pour la gestion des véhicules ---
router.get("/", vehiculeController.getVehicules);                                    // Liste tous les véhicules
router.get("/:id", vehiculeController.getVehiculeById);                              // Récupère le détail d'un véhicule par son identifiant

// Création d'un véhicule (avec validation des données)
router.post(
  "/",
  createVehiculeRules,  // Règles de validation pour la création d'un véhicule
  validate,             // Middleware de validation des données
  vehiculeController.createVehicule
);

// Mise à jour d'un véhicule (avec validation des données)
router.put(
  "/:id",
  updateVehiculeRules,  // Règles de validation pour la mise à jour d'un véhicule
  validate,             // Middleware de validation des données
  vehiculeController.updateVehicule
);

module.exports = router;
