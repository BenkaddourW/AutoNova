// src/controllers/utilisateurController.js
const utilisateurService = require('../services/utilisateurService');
const jwt = require('jsonwebtoken');

class UtilisateurController {
  
  // --- Méthodes du contrôleur ---

  async login(req, res) {
    try {
        const { email, motdepasse } = req.body;
        if (!email || !motdepasse) {
            return res.status(400).json({ message: "Email et mot de passe sont requis." });
        }
        const utilisateur = await utilisateurService.login(email, motdepasse);

        if (!utilisateur) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }
        
        const payload = {
            idutilisateur: utilisateur.idutilisateur,
            email: utilisateur.email,
            roles: utilisateur.Roles.map(r => r.role)
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ accessToken });

    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
  }

  async getAllUtilisateurs(req, res) {
    try {
      const utilisateurs = await utilisateurService.getAllUtilisateurs();
      res.json(utilisateurs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUtilisateurById(req, res) {
    try {
      const utilisateur = await utilisateurService.getUtilisateurById(req.params.id);
      res.json(utilisateur);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createUtilisateur(req, res) {
    try {
      const newUtilisateur = await utilisateurService.createUtilisateur(req.body);
      res.status(201).json(newUtilisateur);
    } catch (error) {
      // Gérer les différents types d'erreurs (validation, conflit, etc.)
      res.status(400).json({ message: error.message });
    }
  }

  async updateUtilisateur(req, res) {
    try {
      const updatedUtilisateur = await utilisateurService.updateUtilisateur(req.params.id, req.body);
      res.json(updatedUtilisateur);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteUtilisateur(req, res) {
    try {
      await utilisateurService.deleteUtilisateur(req.params.id);
      res.status(204).send(); // 204 No Content est plus approprié pour un DELETE réussi
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

// LIGNE CRUCIALE : Assurez-vous que cette ligne est présente et correcte
module.exports = new UtilisateurController();