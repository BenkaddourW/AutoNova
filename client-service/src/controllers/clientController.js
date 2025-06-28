const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const Client = require("../models/client")(sequelize, DataTypes);
const axios = require("axios");

// URL de l'API Gateway
const GATEWAY_URL = process.env.GATEWAY_URL || "http://localhost:3000";

// Créer le profil client (complétion initiale)
exports.createClient = async (req, res) => {
  try {
    const user = req.user; // injecté par la gateway
    
    // Sépare les champs utilisateur et client
    const {
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      email,
      ...clientFields
    } = req.body;

    // Crée le profil client
    const client = await Client.create({
      ...clientFields,
      idutilisateur: user.idutilisateur
    });

    // Met à jour les champs utilisateur via auth-service (via la gateway)
    if (
      adresse1 !== undefined ||
      adresse2 !== undefined ||
      ville !== undefined ||
      codepostal !== undefined ||
      province !== undefined ||
      pays !== undefined ||
      numerotelephone !== undefined ||
      numeromobile !== undefined ||
      email !== undefined
    ) {
      await axios.put(
        `${GATEWAY_URL}/auth/utilisateurs/${user.idutilisateur}`,
        {
          adresse1,
          adresse2,
          ville,
          codepostal,
          province,
          pays,
          numerotelephone,
          numeromobile,
          email,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
    }

    res.status(201).json(client);
  } catch (err) {
    console.error("Erreur dans createClient:", err.message);
    res.status(400).json({
      message: "Erreur lors de la création du client.",
      error: err.message,
    });
  }
};

// Mettre à jour le profil client (route accessible par le client connecté)
exports.updateMyProfile = async (req, res) => {
  try {
    const user = req.user;

    console.log("Utilisateur connecté :", user);

    const client = await Client.findOne({
      where: { idutilisateur: user.idutilisateur },
    });
    if (!client) {
      console.log("Client non trouvé pour l'utilisateur :", user.idutilisateur);
      return res.status(404).json({ message: "Client non trouvé." });
    }

    // Sépare les champs utilisateur et client
    const {
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      email,
      ...clientFields
    } = req.body;

    console.log("Champs client à mettre à jour :", clientFields);
    console.log("Champs utilisateur à envoyer à auth-service :", {
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      email,
    });

    // Mets à jour les champs client
    await Client.update(clientFields, { where: { idclient: client.idclient } });

    // Mets à jour les champs utilisateur via auth-service (via la gateway)
    const authServiceResponse = await axios.put(
      `${GATEWAY_URL}/auth/utilisateurs/${user.idutilisateur}`,
      {
        adresse1,
        adresse2,
        ville,
        codepostal,
        province,
        pays,
        numerotelephone,
        numeromobile,
        email,
      },
      {
        headers: { Authorization: req.headers.authorization },
      }
    );

    console.log("Réponse du auth-service :", authServiceResponse.data);

    const updatedClient = await Client.findByPk(client.idclient);

    res.json(updatedClient);
  } catch (err) {
    console.error("Erreur dans updateMyProfile:", err.message);
    res.status(400).json({
      message: "Erreur lors de la mise à jour du profil.",
      error: err.message,
    });
  }
};

// Mettre à jour le profil client (route uniquement accessible par un employé ou un admin)

exports.updateClient = async (req, res) => {
  try {
    const { idclient } = req.params;
    const user = req.user;

    const client = await Client.findByPk(idclient);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    // Seuls un employé ou un admin peuvent utiliser cette route
    if (user.role !== "admin" && user.role !== "employe") {
      return res.status(403).json({ message: "Accès interdit." });
    }

    // Sépare les champs utilisateur et client
    const {
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      email,
      ...clientFields
    } = req.body;

    // Mets à jour les champs client
    await Client.update(clientFields, { where: { idclient } });

    // Mets à jour les champs utilisateur via auth-service (via la gateway) si des champs utilisateur sont présents
    if (
      adresse1 !== undefined ||
      adresse2 !== undefined ||
      ville !== undefined ||
      codepostal !== undefined ||
      province !== undefined ||
      pays !== undefined ||
      numerotelephone !== undefined ||
      numeromobile !== undefined ||
      email !== undefined
    ) {
      await axios.put(
        `${GATEWAY_URL}/auth/utilisateurs/${client.idutilisateur}`,
        {
          adresse1,
          adresse2,
          ville,
          codepostal,
          province,
          pays,
          numerotelephone,
          numeromobile,
          email,
        },
        {
          headers: { Authorization: req.headers.authorization },
        }
      );
    }

    const updatedClient = await Client.findByPk(idclient);

    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour du client.",
      error: err.message,
    });
  }
};

// Récupérer le client avec toutes ses infos (profil + utilisateur)
//uniquement un employe ou un admin peut accéder à cette route
exports.getClient = async (req, res) => {
  try {
    const { idclient } = req.params;
    const user = req.user; // injecté par la gateway

    const client = await Client.findByPk(idclient);
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    // Seul un admin ou un employé peut accéder à n'importe quel client
    if (user.role === "client") {
      return res.status(403).json({ message: "Accès interdit." });
    }

    // Récupérer les infos utilisateur via la gateway
    const response = await axios.get(
      `${GATEWAY_URL}/auth/utilisateurs/${client.idutilisateur}`
    );
    const utilisateur = response.data;

    res.json({
      ...client.toJSON(),
      utilisateur,
    });
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la récupération du client.",
      error: err.message,
    });
  }
};

// Lister tous les clients (optionnel)
exports.getAllClients = async (req, res) => {
  try {
    const user = req.user;
    // Seuls les employés et admins peuvent voir la liste
    if (user.role === "client") {
      return res.status(403).json({ message: "Accès interdit." });
    }

    const clients = await Client.findAll();
    const clientsWithUser = await Promise.all(
      clients.map(async (client) => {
        try {
          const response = await axios.get(
            `${GATEWAY_URL}/auth/utilisateurs/${client.idutilisateur}`
          );
          return {
            ...client.toJSON(),
            utilisateur: response.data,
          };
        } catch (err) {
          return {
            ...client.toJSON(),
            utilisateur: null,
          };
        }
      })
    );
    res.json(clientsWithUser);
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la récupération des clients.",
      error: err.message,
    });
  }
};

// Route pour que le client récupère ses propres infos
exports.getMyClientInfo = async (req, res) => {
  try {
    const user = req.user; // injecté par la gateway
    const client = await Client.findOne({
      where: { idutilisateur: user.idutilisateur },
    });
    if (!client) {
      return res.status(404).json({ message: "Client non trouvé." });
    }

    // Récupérer les infos utilisateur via la gateway
    const response = await axios.get(
      `${GATEWAY_URL}/auth/utilisateurs/${user.idutilisateur}`
    );
    const utilisateur = response.data;

    res.json({
      ...client.toJSON(),
      utilisateur,
    });
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la récupération du client.",
      error: err.message,
    });
  }
};


/**
 * Récupère un profil client en se basant sur l'ID de l'utilisateur associé.
 * C'est un endpoint de service utilisé par d'autres microservices.
 * @param {object} req - L'objet de la requête, contenant req.params.idUtilisateur.
 * @param {object} res - L'objet de la réponse.
 */
exports.getClientByUserId = async (req, res) => {
  try {
    // 1. On récupère l'idutilisateur depuis les paramètres de l'URL
    const { idUtilisateur } = req.params;

    // 2. On cherche le client dans la base de données avec cet idutilisateur
    const client = await Client.findOne({
      where: { idutilisateur: idUtilisateur }
    });

    // 3. Si on ne trouve rien, on renvoie une erreur 404
    if (!client) {
      return res.status(404).json({ message: "Aucun profil client trouvé pour cet utilisateur." });
    }

    // 4. Si on trouve le client, on renvoie ses informations
    res.json(client);

  } catch (err) {
    // En cas d'erreur serveur (ex: DB inaccessible)
    res.status(500).json({
      message: "Erreur lors de la récupération du profil client.",
      error: err.message,
    });
  }
};
