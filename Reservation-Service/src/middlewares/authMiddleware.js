const jwt = require("jsonwebtoken");

/**
 * Middleware d'authentification JWT
 * ---------------------------------
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization.
 * Si valide, ajoute le payload décodé à req.user.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  // Vérifie si l'en-tête existe et s'il est au format "Bearer TOKEN"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorisé, format de token invalide.' });
  }
  
  // Extrait le token
  const token = authHeader.split(' ')[1];
  
  try {
    // Vérifie le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attache le payload décodé à req.user
    // Si votre token a été créé avec { id: ..., role: ... }, alors decoded sera cet objet.
    req.user = decoded; 
    
    // Passe à la suite
    next();
  } catch (error) {
    // Si jwt.verify échoue (token expiré, invalide, etc.)
    return res.status(401).json({ message: 'Non autorisé, token invalide.' });
  }
};

module.exports = { protect };
