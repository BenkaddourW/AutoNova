const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateJWT } = require("../middlewares/authMiddleware");
//const authenticateJWT = require("../middlewares/authMiddleware");

// Inscription
router.post("/register", authController.register);

// Connexion
router.post("/login", authController.login);

// Déconnexion
router.post("/logout", authController.logout);

// Rafraîchir le token d'accès
router.post("/refresh-token", authController.refreshToken);

//Route pour recuperer tous les utilisateurs
router.get("/utilisateurs", authenticateJWT, authController.getUtilisateurs);

// Récupérer un utilisateur par son id
router.get("/utilisateurs/:idutilisateur", authController.getUtilisateurById);

// Récupérer un utilisateur par id
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

//Creer un admin ou employe
router.post("/admin/create-user", authController.createUserByAdmin);

module.exports = router;
