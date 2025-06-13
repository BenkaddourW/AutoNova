const Utilisateur = require("../models/utilisateur");
const TokenSession = require("../models/token_session");
const Role = require("../models/role");
const UtilisateurRole = require("../models/utilisateur_role");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwtUtils");
const bcrypt = require("bcrypt");

// Enregistrement utilisateur
exports.register = async (req, res) => {
  try {
    const {
      email,
      motdepasse,
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
      role, // le rôle à attribuer, ex: "client"
    } = req.body;

    // Vérification des champs obligatoires
    if (
      !email ||
      !motdepasse ||
      !nom ||
      !prenom ||
      !adresse1 ||
      !ville ||
      !codepostal ||
      !province ||
      !pays ||
      !numerotelephone ||
      !role
    ) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis.",
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const utilisateurExiste = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExiste) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Hacher le mot de passe
    const hash = await bcrypt.hash(motdepasse, 10);

    // Créer l'utilisateur
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

    // Vérifier si le refresh token existe en base
    const session = await TokenSession.findOne({
      where: { token: refreshToken, type: "refresh" },
    });
    if (!session) {
      return res.status(401).json({ message: "Refresh token invalide." });
    }

    // Vérifier la validité du refresh token
    let payload;
    try {
      payload = verifyToken(refreshToken);
      
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Refresh token expiré ou invalide." });
    }

    // Générer un nouveau access token
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
// Middleware pour vérifier l'authentification
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token d'accès requis." });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findByPk(payload.idutilisateur);
    if (!utilisateur) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    req.utilisateur = utilisateur; // Ajouter l'utilisateur à la requête
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token invalide ou expiré.", error: error.message });
  }
};
// Middleware pour vérifier le rôle de l'utilisateur
exports.authorize = (roles) => {
  return async (req, res, next) => {
    try {
      const utilisateur = req.utilisateur; // Récupérer l'utilisateur de la requête
      if (!utilisateur) {
        return res.status(403).json({ message: "Accès interdit." });
      }

      // Vérifier si l'utilisateur a un des rôles autorisés
      const utilisateurRole = await UtilisateurRole.findOne({
        where: { idutilisateur: utilisateur.idutilisateur },
      });
      if (!utilisateurRole || !roles.includes(utilisateurRole.idrole)) {
        return res.status(403).json({ message: "Accès interdit." });
      }

      next();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Erreur serveur.", error: error.message });
    }
  };
};
