const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Passe à true pour voir les requêtes SQL dans la console
});

// Import des modèles
const Utilisateur = require("../models/utilisateur");
const Client = require("../models/client");
const Employe = require("../models/employe");

// Associations
Utilisateur.hasOne(Client, { foreignKey: "idutilisateur" });
Client.belongsTo(Utilisateur, { foreignKey: "idutilisateur" });

Utilisateur.hasOne(Employe, { foreignKey: "idutilisateur" });
Employe.belongsTo(Utilisateur, { foreignKey: "idutilisateur" });

// Exporte sequelize et les modèles pour utilisation ailleurs
module.exports = {
  sequelize,
  Utilisateur,
  Client,
  Employe,
};
