const jwt = require("jsonwebtoken");

// Récupère le secret depuis le .env
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
    req.user = user; // Ajoute les infos du user décodées dans la requête
    next();
  });
}

module.exports = authenticateToken;

