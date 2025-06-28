// const Utilisateur = require("../models/utilisateur");
// const Client = require("../models/client");
// const Employe = require("../models/employe");
// const Role = require("../models/role");
// const UtilisateurRole = require("../models/utilisateur_role");
const { Op } = require("sequelize");
const { Utilisateur, Role, Employe, UtilisateurRole } = require("../models");

const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwtUtils");
const TokenSession = require("../models/token_session");
const jwt = require("jsonwebtoken");

/////
// Inscription de base du client
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

/////////
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

    // Récupérer l'id de la succursale si employé
    let idsuccursale = null;
    if (role === "employe") {
      const employe = await Employe.findOne({
        where: { idutilisateur: utilisateur.idutilisateur },
      });
      if (employe) {
        idsuccursale = employe.idsuccursale;
      }
    }

    const payload = {
      idutilisateur: utilisateur.idutilisateur,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: role,
      idsuccursale: idsuccursale, // null pour admin/client, défini pour employé
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
        idsuccursale: idsuccursale,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

/////////
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

//////////
// Déconnexion utilisateur
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requis." });
    }

    // Décoder le refreshToken pour obtenir l'idutilisateur
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Refresh token invalide." });
    }

    const idutilisateur = decoded.idutilisateur;

    // Suppression du refreshToken pour cet utilisateur
    const result = await TokenSession.destroy({
      where: { token: refreshToken, idutilisateur: idutilisateur },
    });

    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Token non trouvé pour cet utilisateur." });
    }

    res.status(200).json({ message: "Déconnexion réussie." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la déconnexion." });
  }
};

///////
// Récupérer un utilisateur par son id
exports.getUtilisateurById = async (req, res) => {
  try {
    const { idutilisateur } = req.params;
    const utilisateur = await Utilisateur.findByPk(idutilisateur);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json(utilisateur);
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la récupération de l'utilisateur.",
      error: err.message,
    });
  }
};

//////
// Mettre à jour son propre profil
exports.updateUtilisateur = async (req, res) => {
  try {
    const { idutilisateur } = req.params;
    const user = req.user; // injecté par le middleware JWT

    const utilisateur = await Utilisateur.findByPk(idutilisateur);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Un client ne peut mettre à jour que son propre profil
    if (
      user.role === "client" &&
      user.idutilisateur !== Number(idutilisateur)
    ) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    // Employé ou admin : peut mettre à jour n'importe quel utilisateur
    await Utilisateur.update(req.body, { where: { idutilisateur } });
    const updatedUtilisateur = await Utilisateur.findByPk(idutilisateur);

    res.json(updatedUtilisateur);
  } catch (err) {
    res.status(400).json({
      message: "Erreur lors de la mise à jour de l'utilisateur.",
      error: err.message,
    });
  }
};

/////////
// Création d'un utilisateur (admin ou employé) par un admin
exports.createUserByAdmin = async (req, res) => {
  try {
    const {
      email,
      motdepasse,
      nom,
      prenom,
      role,
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      idsuccursale,
      dateembauche,
      datedepart,
      // codeemploye retiré, il sera généré automatiquement par le modèle
    } = req.body;
    console.log("Payload reçu:", req.body);

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

    // 1. Créer l'utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      email,
      motdepasse: hash,
      nom,
      prenom,
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
    });

    // 2. Associer le rôle
    const roleObj = await Role.findOne({ where: { role } });
    if (!roleObj) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    await UtilisateurRole.create({
      idutilisateur: nouvelUtilisateur.idutilisateur,
      idrole: roleObj.idrole,
    });

    // 3. Si employé ou admin, créer dans employe
    if (role === "employe" || role === "admin") {
      await Employe.create({
        idutilisateur: nouvelUtilisateur.idutilisateur,
        // codeemploye non transmis, généré automatiquement par le modèle
        dateembauche,
        datedepart,
        idsuccursale: role === "employe" ? idsuccursale : null,
      });
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      utilisateur: {
        idutilisateur: nouvelUtilisateur.idutilisateur,
        email: nouvelUtilisateur.email,
        nom: nouvelUtilisateur.nom,
        prenom: nouvelUtilisateur.prenom,
        role: roleObj.role,
        idsuccursale: role === "employe" ? idsuccursale : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};

///////
// Récupérer tous les utilisateurs avec options de filtrage
exports.getUtilisateurs = async (req, res) => {
  try {
    const { nom, prenom, role, idsuccursale } = req.query;
    const where = {};

    if (nom) where.nom = { [Op.like]: `%${nom}%` };
    if (prenom) where.prenom = { [Op.like]: `%${prenom}%` };
    if (role) where["$Roles.role$"] = role;
    if (idsuccursale) where["$Employes.idsuccursale$"] = idsuccursale;

    const utilisateurs = await Utilisateur.findAll({
      where,
      include: [
        {
          model: Role,
          as: "Roles",
          through: { attributes: [] },
        },
        {
          model: Employe,
          as: "Employes",
        },
      ],
      order: [["idutilisateur", "DESC"]],
    });

    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};
