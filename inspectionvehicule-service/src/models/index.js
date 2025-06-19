// Fichier : src/models/index.js

const sequelize = require('../config/database');

// 1. Importer les définitions de modèles
const Inspection = require('./inspection');
const InspectionImage = require('./inspection_image');

// 2. Définir les associations en un seul endroit centralisé
Inspection.hasMany(InspectionImage, { 
  foreignKey: 'idinspection', 
  as: 'InspectionImages',
  onDelete: 'CASCADE' // Bonne pratique : si on supprime une inspection, ses images sont aussi supprimées.
});

InspectionImage.belongsTo(Inspection, { 
  foreignKey: 'idinspection' 
});

// 3. Exporter tous les modèles et la connexion pour le reste de l'application
const db = {
  sequelize,
  Inspection,
  InspectionImage
};

module.exports = db;
