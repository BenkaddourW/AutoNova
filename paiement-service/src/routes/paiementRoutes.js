const express = require("express");
const router = express.Router();
const paiementController = require("../controllers/paiementController");

// Crée un PaymentIntent Stripe et retourne le clientSecret au frontend pour permettre un paiement sécurisé
router.post("/intent", paiementController.createPaymentIntent);

// Enregistre un paiement manuel pour un contrat et active le contrat concerné
router.post("/paiement-contrat", paiementController.enregistrerPaiementContrat);

// Enregistre un paiement confirmé (Stripe ou autre)
router.post("/enregistrer", paiementController.enregistrerPaiement);

// Effectue un remboursement via Stripe et l’enregistre dans la base de données
router.post("/rembourser", paiementController.rembourserPaiement);

module.exports = router;
