const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/authMiddleware");

// Inscription
router.post("/register", authController.register);

// Connexion
router.post("/login", authController.login);

// Déconnexion
router.post("/logout", authController.logout);

// Rafraîchir le token d'accès
router.post("/refresh-token", authController.refreshToken);

// Récupérer un utilisateur par son id
router.get("/utilisateurs/:idutilisateur", authController.getUtilisateurById);

// Récupérer un utilisateur par id
router.get("/utilisateurs/:idutilisateur", authController.getUtilisateurById);

router.use(authenticate); 

// Récupérer les informations de l'utilisateur connecté (PROTÉGÉE)
router.post("/complete-profile", authController.completeProfile);


// Récupérer un utilisateur par son id
// Maintenant protégée par router.use(authenticate)
router.get("/utilisateurs/:idutilisateur", authController.getUtilisateurById);

// Mettre à jour son propre profil
router.put(
  "/profile",
  (req, res, next) => {
    // Ajoute l'idutilisateur du token dans req.params pour réutiliser le contrôleur
    req.params.idutilisateur = req.user.idutilisateur;
    next();
  },
  authController.updateUtilisateur
);

// Mettre à jour n'importe quel utilisateur (admin/employé)
router.put("/utilisateurs/:idutilisateur", authController.updateUtilisateur);

module.exports = router;
