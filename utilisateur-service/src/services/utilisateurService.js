// src/services/utilisateurService.js
const { Utilisateur, Role, sequelize } = require('../models'); // Import centralisé !
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

class UtilisateurService {

  async getAllUtilisateurs() {
    return Utilisateur.findAll({
      attributes: { exclude: ['motdepasse'] }, // Ne jamais renvoyer le mot de passe
      include: [{ model: Role, attributes: ['role'], through: { attributes: [] } }]
    });
  }

  async getUtilisateurById(id) {
    const utilisateur = await Utilisateur.findByPk(id, {
      attributes: { exclude: ['motdepasse'] },
      include: [{ model: Role, attributes: ['role'], through: { attributes: [] } }]
    });
    if (!utilisateur) {
      throw new Error(`Utilisateur non trouvé avec l'ID: ${id}`);
    }
    return utilisateur;
  }

  async getUtilisateurByEmail(email) {
    // Cette méthode est sensible, elle est utilisée pour la connexion
    // Elle doit retourner le mot de passe pour la comparaison
    const utilisateur = await Utilisateur.findOne({
      where: { email: email },
      include: [{ model: Role, attributes: ['role'], through: { attributes: [] } }]
    });
    // Pas d'erreur "non trouvé" pour des raisons de sécurité (évite l'énumération d'emails)
    return utilisateur; 
  }

  async createUtilisateur(utilisateurData) {
    const { email, motdepasse, nom, prenom, roles } = utilisateurData;

    if (!email || !motdepasse || !nom || !prenom) {
        throw new Error("Les champs email, motdepasse, nom et prenom sont requis.");
    }
    
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà.');
    }

    // Hachage du mot de passe - ÉTAPE CRUCIALE
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    // Transaction pour garantir l'intégrité (création utilisateur + assignation rôle)
    const t = await sequelize.transaction();
    try {
        const newUtilisateur = await Utilisateur.create({
            ...utilisateurData,
            motdepasse: hashedPassword, // Stocker le mot de passe haché
            estactif: true,
        }, { transaction: t });

        if (roles && Array.isArray(roles) && roles.length > 0) {
            const dbRoles = await Role.findAll({ where: { role: { [Op.in]: roles } } });
            await newUtilisateur.setRoles(dbRoles, { transaction: t });
        } else {
            // Assigner un rôle par défaut "client" si aucun rôle n'est fourni
            const defaultRole = await Role.findOne({ where: { role: 'client' } });
            if (defaultRole) {
                await newUtilisateur.addRole(defaultRole, { transaction: t });
            }
        }

        await t.commit();
        
        // Recharger l'utilisateur pour obtenir les données complètes avec les rôles
        return this.getUtilisateurById(newUtilisateur.idutilisateur);

    } catch(error) {
        await t.rollback();
        throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  async updateUtilisateur(id, utilisateurData) {
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      throw new Error(`Utilisateur non trouvé avec l'ID: ${id}`);
    }
    
    // Le mot de passe ne doit pas être mis à jour via cette route générique
    const { motdepasse, ...updatableData } = utilisateurData;

    await utilisateur.update(updatableData);

    if (updatableData.roles && Array.isArray(updatableData.roles)) {
        const dbRoles = await Role.findAll({ where: { role: { [Op.in]: updatableData.roles } } });
        await utilisateur.setRoles(dbRoles);
    }

    return this.getUtilisateurById(id);
  }

  async deleteUtilisateur(id) {
    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      throw new Error(`Utilisateur non trouvé avec l'ID: ${id}`);
    }
    await utilisateur.destroy();
    return { message: `Utilisateur avec l'ID ${id} supprimé.` };
  }
}

module.exports = new UtilisateurService();
