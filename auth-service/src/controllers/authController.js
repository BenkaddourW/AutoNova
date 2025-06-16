const Utilisateur = require("../models/utilisateur");
const Client = require("../models/client");
const Employe = require("../models/employe");
const Role = require("../models/role");
const UtilisateurRole = require("../models/utilisateur_role");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwtUtils");
const TokenSession = require("../models/token_session");

// Inscription de base
exports.register = async (req, res) => {
  try {
    const { email, motdepasse, nom, prenom, role } = req.body;

    if (!email || !motdepasse || !nom || !prenom || !role) {
      return res
        .status(400)
        .json({ message: "Champs obligatoires manquants." });
    }

    const utilisateurExiste = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExiste) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const hash = await bcrypt.hash(motdepasse, 10);

    const nouvelUtilisateur = await Utilisateur.create({
      email,
      motdepasse: hash,
      nom,
      prenom,
    });

    // Associer le rôle
    const roleObj = await Role.findOne({ where: { role } });
    if (!roleObj) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    await UtilisateurRole.create({
      idutilisateur: nouvelUtilisateur.idutilisateur,
      idrole: roleObj.idrole,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      utilisateur: {
        idutilisateur: nouvelUtilisateur.idutilisateur,
        email: nouvelUtilisateur.email,
        nom: nouvelUtilisateur.nom,
        prenom: nouvelUtilisateur.prenom,
        role: roleObj.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Complétion du profil utilisateur
exports.completeProfile = async (req, res) => {
  try {
    const { idutilisateur } = req.user; // suppose un middleware d'authentification
    const {
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      // Champs spécifiques client
      codeclient,
      numeropc,
      paysdelivrance,
      autoritedelivrance,
      datenaissance,
      dateexpiration,
      // Champs spécifiques employé/admin
      codeemploye,
      dateembauche,
      datedepart,
      idsuccursale,
    } = req.body;

    // Mise à jour du profil utilisateur
    await Utilisateur.update(
      {
        adresse1,
        adresse2,
        ville,
        codepostal,
        province,
        pays,
        numerotelephone,
        numeromobile,
      },
      { where: { idutilisateur } }
    );

    // Récupérer le rôle de l'utilisateur
    const utilisateurRole = await UtilisateurRole.findOne({
      where: { idutilisateur },
    });
    const roleObj = await Role.findOne({
      where: { idrole: utilisateurRole.idrole },
    });

    if (roleObj.role === "client") {
      // Créer ou mettre à jour le profil client
      await Client.upsert({
        idutilisateur,
        codeclient,
        numeropc,
        paysdelivrance,
        autoritedelivrance,
        datenaissance,
        dateexpiration,
      });
    } else if (roleObj.role === "employe" || roleObj.role === "admin") {
      // Créer ou mettre à jour le profil employé (pour employe ET admin)
      await Employe.upsert({
        idutilisateur,
        codeemploye,
        dateembauche,
        datedepart,
        idsuccursale,
      });
    }

    res.json({ message: "Profil complété avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { email, motdepasse } = req.body;
    if (!email || !motdepasse) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    const utilisateur = await Utilisateur.findOne({ where: { email } });
    if (!utilisateur) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const passwordMatch = await bcrypt.compare(
      motdepasse,
      utilisateur.motdepasse
    );
    if (!passwordMatch) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    // Récupérer le rôle de l'utilisateur
    const utilisateurRole = await UtilisateurRole.findOne({
      where: { idutilisateur: utilisateur.idutilisateur },
    });
    let role = null;
    if (utilisateurRole) {
      const roleObj = await Role.findOne({
        where: { idrole: utilisateurRole.idrole },
      });
      role = roleObj ? roleObj.role : null;
    }

    const payload = {
      idutilisateur: utilisateur.idutilisateur,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Enregistrer le refresh token en base
    await TokenSession.create({
      idutilisateur: utilisateur.idutilisateur,
      token: refreshToken,
      type: "refresh",
      dateexpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken,
      refreshToken,
      utilisateur: {
        idutilisateur: utilisateur.idutilisateur,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Rafraîchir le token d'accès
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requis." });
    }

    const session = await TokenSession.findOne({
      where: { token: refreshToken, type: "refresh" },
    });
    if (!session) {
      return res.status(401).json({ message: "Refresh token invalide." });
    }

    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Refresh token expiré ou invalide." });
    }

    const newAccessToken = generateAccessToken({
      idutilisateur: payload.idutilisateur,
      email: payload.email,
      nom: payload.nom,
      prenom: payload.prenom,
      role: payload.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

// Déconnexion utilisateur
exports.logout = async (req, res) => {
  try {
    const { idutilisateur } = req.user; // suppose un middleware d'authentification
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requis." });
    }

    // Supprimer le refresh token de la base
    await TokenSession.destroy({
      where: { idutilisateur, token: refreshToken, type: "refresh" },
    });

    res.json({ message: "Déconnexion réussie." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
