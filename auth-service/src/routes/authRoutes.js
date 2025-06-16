const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

// Inscription
router.post("/register", authController.register);

// Connexion
router.post("/login", authController.login);

// Déconnexion
router.post("/logout", authenticate, authController.logout);

// Rafraîchir le token d'accès
router.post("/refresh-token", authController.refreshToken);

// Complétion du profil (protégée)
router.put("/profile", authenticate, authController.completeProfile);

module.exports = router;
