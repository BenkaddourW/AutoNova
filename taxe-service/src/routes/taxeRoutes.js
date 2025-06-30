/**
 * Définition des routes du service Taxe
 * -------------------------------------
 * Ce fichier centralise la déclaration des routes HTTP liées à la gestion des taxes.
 * Chaque route est associée à une méthode du contrôleur correspondant.
 * Certaines routes intègrent des middlewares de validation pour garantir l'intégrité des données reçues.
 */

const express = require('express');
const router = express.Router();
const taxeController = require('../controllers/taxeController');
const validate = require('../middlewares/validate');
const { createTaxeRules, updateTaxeRules } = require('../validators/taxeValidator');
const TaxesReservation = require('../models/taxes_reservation');

// --- Calcul et consultation des taxes par localité ---
router.post('/calculate', taxeController.calculateTaxes);           // Calcule les taxes applicables à une localité et un montant donné
router.get('/by-localite', taxeController.getTaxesByLocalite);      // Récupère les taxes applicables à une localité spécifique

// --- Consultation des taxes appliquées à une réservation ou un contrat ---
router.get("/by-reservation/:id", taxeController.getTaxesByReservationId); // Liste les taxes appliquées à une réservation
router.get("/by-contrat/:id", taxeController.getTaxesByContratId);        // Liste les taxes appliquées à un contrat
router.post("/taxes-contrat", taxeController.createTaxesContrat);         // Enregistre les taxes appliquées à un contrat

// --- Routes CRUD pour la gestion des taxes ---
router.get('/', taxeController.getTaxes);                                 // Liste toutes les taxes avec leurs localités
router.get('/:id', taxeController.getTaxeById);                           // Récupère une taxe par son identifiant
router.post('/', createTaxeRules, validate, taxeController.createTaxe);   // Crée une nouvelle taxe avec validation
router.put('/:id', updateTaxeRules, validate, taxeController.updateTaxe); // Met à jour une taxe existante avec validation
router.delete('/:id', taxeController.deleteTaxe);                         // Supprime une taxe et ses localités associées

module.exports = router;
