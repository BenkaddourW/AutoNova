const express = require("express");
const router = express.Router();
const paiementController = require("../controllers/paiementController");

// Crée un PaymentIntent Stripe et retourne le clientSecret au frontend pour initier un paiement sécurisé
router.post("/intent", paiementController.createPaymentIntent);

// Route pour enregistrer le paiement confirmé
router.post("/enregistrer", paiementController.enregistrerPaiement);

// Effecture un remboursement Stripe et l’enregistre dans la base
router.post("/rembourser", paiementController.rembourserPaiement);

// Simulation d'un paiement pour un contrat (sans Stripe)
router.post("/paiement-contrat", paiementController.enregistrerPaiementContrat);

module.exports = router;
