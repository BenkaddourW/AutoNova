// models/index.js

"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};

// On récupère notre instance sequelize depuis la configuration
const sequelize = require("../config/database");

// Lire tous les fichiers du dossier courant (models)
fs.readdirSync(__dirname)
  .filter((file) => {
    // Filtrer pour garder les fichiers .js, sauf index.js lui-même
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    // Importer la fonction de définition du modèle
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    // L'ajouter à notre objet db
    db[model.name] = model;
  });

// Gérer les associations si elles sont définies
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exporter l'instance de sequelize et tous les modèles
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
