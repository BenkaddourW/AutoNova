// src/routes/utilisateurRoutes.js
const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const authenticateToken = require('../middlewares/authMiddleware.js');

// --- Définition des routes ---

// Routes publiques (ne nécessitent pas de token)
router.post('/login', utilisateurController.login);
router.post('/', utilisateurController.createUtilisateur);

// Le middleware s'appliquera à toutes les routes définies après cette ligne
router.use(authenticateToken);

// Routes protégées (nécessitent un token valide)
router.get('/', utilisateurController.getAllUtilisateurs);
router.get('/:id', utilisateurController.getUtilisateurById);
router.put('/:id', utilisateurController.updateUtilisateur);
router.delete('/:id', utilisateurController.deleteUtilisateur);

// LIGNE CRUCIALE : Assurez-vous que cette ligne est présente
module.exports = router;
