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
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize"); 

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
    const { idutilisateur } = req.user;
    const {
      adresse1,
      adresse2,
      ville,
      codepostal,
      province,
      pays,
      numerotelephone,
      numeromobile,
      codeclient,
      numeropc,
      paysdelivrance,
      autoritedelivrance,
      datenaissance,
      dateexpiration,
      codeemploye,
      dateembauche,
      datedepart,
      idsuccursale,
    } = req.body;

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

    const utilisateurRole = await UtilisateurRole.findOne({
      where: { idutilisateur },
    });

    const roleObj = await Role.findOne({
      where: { idrole: utilisateurRole.idrole },
    });

    if (roleObj.role === "client") {
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

    // --- DEBUT DE L'AMÉLIORATION ---
    // Récupérer l'id de la succursale si l'utilisateur est un employé
    let idsuccursale = null;
    if (role === "employe") {
      const employe = await Employe.findOne({
        where: { idutilisateur: utilisateur.idutilisateur },
      });
      if (employe) {
        idsuccursale = employe.idsuccursale;
      }
    }
    // --- FIN DE L'AMÉLIORATION ---

    const payload = {
      idutilisateur: utilisateur.idutilisateur,
      email: utilisateur.email,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      role: role,
      idsuccursale: idsuccursale, // Contient l'ID de la succursale ou null
    };
    
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await TokenSession.create({
      idutilisateur: utilisateur.idutilisateur,
      token: refreshToken,
      type: "refresh",
      dateexpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.json({
      accessToken,
      refreshToken,
      utilisateur: payload,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};


// Rafraîchir le token
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
      return res.status(401).json({ message: "Refresh token invalide ou révoqué." });
    }

    let payload;
    try {
      // On utilise votre utilitaire pour vérifier le token
      payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Refresh token expiré ou invalide." });
    }

    // On recrée un payload propre pour le nouveau access token
    // C'est ici la légère différence : on ne prend que les infos essentielles
    const newAccessTokenPayload = {
      idutilisateur: payload.idutilisateur,
      email: payload.email,
      nom: payload.nom,
      prenom: payload.prenom,
      role: payload.role,
      idsuccursale: payload.idsuccursale, // Important de le garder pour la cohérence
    };

    const newAccessToken = generateAccessToken(newAccessTokenPayload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur.", error: error.message });
  }
};


// Déconnexion
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requis." });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Refresh token invalide." });
    }

    const idutilisateur = decoded.idutilisateur;

    const result = await TokenSession.destroy({
      where: { token: refreshToken, idutilisateur },
    });

    if (result === 0) {
      return res.status(404).json({ message: "Token non trouvé pour cet utilisateur." });
    }

    res.status(200).json({ message: "Déconnexion réussie." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la déconnexion." });
  }
};

// Récupération utilisateur
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

// ✅ Mise à jour utilisateur avec logs
exports.updateUtilisateur = async (req, res) => {
  try {
    const { idutilisateur } = req.params;
    const user = req.user;

    console.log("🔵 Reçu PUT /utilisateurs/" + idutilisateur);
    console.log("🔵 Utilisateur authentifié :", user);
    console.log("🔵 Données reçues dans req.body :", req.body);

    const utilisateur = await Utilisateur.findByPk(idutilisateur);
    if (!utilisateur) {
      console.log("❌ Utilisateur introuvable dans la base.");
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (user.role === "client" && user.idutilisateur !== Number(idutilisateur)) {
      console.log("❌ Tentative de mise à jour d'un autre profil par un client.");
      return res.status(403).json({ message: "Accès interdit." });
    }

    const [nbRowsAffected] = await Utilisateur.update(req.body, {
      where: { idutilisateur },
    });

    if (nbRowsAffected === 0) {
      console.log("⚠️ Aucun champ mis à jour.");
    } else {
      console.log(`✅ Mise à jour réussie pour l'utilisateur ID ${idutilisateur}`);
    }

    const updatedUtilisateur = await Utilisateur.findByPk(idutilisateur);
    res.json(updatedUtilisateur);
  } catch (err) {
    console.error("❌ Erreur dans updateUtilisateur :", err.message);
    console.error(err);
    res.status(400).json({
      message: "Erreur lors de la mise à jour de l'utilisateur.",
      error: err.message,
    });
  }
};


/**
 * [ADMIN] Crée un nouvel utilisateur (employé ou admin)
 * @route POST /admin/create-user
 */
exports.createUserByAdmin = async (req, res) => {
  try {
    const {
      email, motdepasse, nom, prenom, role,
      adresse1, adresse2, ville, codepostal, province, pays,
      numerotelephone, numeromobile, idsuccursale, dateembauche,
    } = req.body;

    if (!email || !motdepasse || !nom || !prenom || !role) {
      return res.status(400).json({ message: "Les champs email, motdepasse, nom, prenom et role sont requis." });
    }

    const utilisateurExiste = await Utilisateur.findOne({ where: { email } });
    if (utilisateurExiste) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    const hash = await bcrypt.hash(motdepasse, 10);
    const nouvelUtilisateur = await Utilisateur.create({
      email, motdepasse: hash, nom, prenom, adresse1, adresse2, ville,
      codepostal, province, pays, numerotelephone, numeromobile,
    });

    const roleObj = await Role.findOne({ where: { role } });
    if (!roleObj) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    await UtilisateurRole.create({
      idutilisateur: nouvelUtilisateur.idutilisateur,
      idrole: roleObj.idrole,
    });

    if (role === "employe" || role === "admin") {
      await Employe.create({
        idutilisateur: nouvelUtilisateur.idutilisateur,
        dateembauche,
        idsuccursale: role === "employe" ? idsuccursale : null,
      });
    }

    res.status(201).json({
      message: "Utilisateur créé avec succès.",
      utilisateur: {
        idutilisateur: nouvelUtilisateur.idutilisateur,
        email: nouvelUtilisateur.email,
        role: roleObj.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la création de l'utilisateur.", error: error.message });
  }
};

/**
 * [ADMIN] Récupère la liste de tous les utilisateurs avec filtres
 * @route GET /utilisateurs
 */
exports.getUtilisateurs = async (req, res) => {
  try {
    const { nom, prenom, role, idsuccursale } = req.query;
    const where = {};

    if (nom) where.nom = { [Op.iLike]: `%${nom}%` };
    if (prenom) where.prenom = { [Op.iLike]: `%${prenom}%` };
    
    const include = [
      {
        model: Role,
        as: "Roles", // Cet alias doit correspondre à celui défini dans vos modèles
        through: { attributes: [] },
      },
      {
        model: Employe,
        as: "Employes", // Cet alias doit correspondre à celui défini dans vos modèles
        required: false,
      },
    ];

    if (role) {
      include[0].where = { role: role };
    }
    if (idsuccursale) {
      include[1].where = { idsuccursale: idsuccursale };
      include[1].required = true;
    }

    const utilisateurs = await Utilisateur.findAll({
      where,
      include,
      order: [["nom", "ASC"], ["prenom", "ASC"]],
    });

    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs.", error: error.message });
  }
};