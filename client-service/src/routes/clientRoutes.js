const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

// Créer un profil client (complétion initiale)
router.post("/clients", clientController.createClient);

// Récupérer les infos du client connecté (par idutilisateur du token)
router.get("/clients/me", clientController.getMyClientInfo);

// Mettre à jour le profil du client connecté
router.put("/clients/me", clientController.updateMyProfile);

// Récupérer la liste de tous les clients (employé/admin uniquement)
router.get("/clients", clientController.getAllClients);

// Récupérer un client par id (employé/admin uniquement)
router.get("/clients/:idclient", clientController.getClient);

// Mettre à jour un client par id (employé/admin uniquement)
router.put("/clients/:idclient", clientController.updateClient);

// Récupérer le client par idutilisateur (pour les employés/admins)
router.get("/clients/by-user/:id", clientController.getClientByUserId);

module.exports = router;
