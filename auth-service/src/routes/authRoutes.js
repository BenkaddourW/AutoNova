const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Inscription
router.post("/register", authController.register);

// Connexion
router.post("/login", authController.login);

// Rafraîchir le token d'accès
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
