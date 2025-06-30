const jwt = require("jsonwebtoken");

// Middleware d'authentification : vérifie le JWT et ajoute user (id, role) à req
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user; // user doit contenir au moins { id, role }
    next();
  });
}

// Middleware : autorise seulement les employés ou admins
function isEmployeOrAdmin(req, res, next) {
  if (req.user && (req.user.role === "employe" || req.user.role === "admin")) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Accès réservé aux employés ou admins" });
}

// Middleware : autorise seulement les clients
function isClient(req, res, next) {
  if (req.user && req.user.role === "client") {
    return next();
  }
  return res.status(403).json({ message: "Accès réservé aux clients" });
}

// Middleware : autorise employé/admin OU client propriétaire du contrat
function authorize(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Non authentifié" });
  if (req.user.role === "employe" || req.user.role === "admin") return next();
  // Pour un client, vérifier qu'il accède à son propre contrat (idclient dans req.user)
  // À compléter dans le contrôleur selon la logique métier
  return next();
}

module.exports = {
  authenticateToken,
  isEmployeOrAdmin,
  isClient,
  authorize,
};
