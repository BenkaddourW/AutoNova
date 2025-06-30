// Fichier: src/middlewares/authorizeRole.js

/**
 * Middleware pour autoriser l'accès à une route en fonction du rôle de l'utilisateur.
 * @param  {...string} roles - La liste des rôles autorisés (ex: 'admin', 'employe').
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // req.user est ajouté par le middleware d'authentification (protect)
    // et doit contenir une propriété 'role'.
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit. Rôle non autorisé." });
    }
    next(); // L'utilisateur a le bon rôle, on continue.
  };
};

module.exports = authorizeRole;
