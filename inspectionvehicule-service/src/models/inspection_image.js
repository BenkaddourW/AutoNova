// Fichier : src/models/inspection_image.js (Version corrigée et finale)

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// NOTE : Nous n'importons PAS le modèle 'Inspection' ici.
// Les associations sont gérées de manière centralisée dans 'src/models/index.js'.

const InspectionImage = sequelize.define(
  // Le nom du modèle en JavaScript (CamelCase)
  'InspectionImage',
  
  // La définition des colonnes (attributs)
  {
    // Le nom de la colonne dans votre base de données est 'idimageinspection'.
    // On utilise l'option 'field' pour faire le lien.
    idimage: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idimageinspection' // CORRESPOND EXACTEMENT AU NOM DE LA COLONNE DANS LA BDD
    },

    urlimage: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'urlimage'
    },

    idinspection: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'idinspection' // Correspond déjà, mais c'est une bonne pratique de le spécifier
    }
  },

  // Les options du modèle
  {
    // Le nom exact de la table dans votre base de données PostgreSQL
    tableName: 'imageinspection',

    // On dit à Sequelize de ne pas chercher les colonnes 'createdAt' et 'updatedAt'
    timestamps: false
  }
);

// IMPORTANT : On ne met PAS les associations (belongsTo, hasMany) ici.
// Elles sont définies dans le fichier 'src/models/index.js' pour éviter les problèmes de chargement.

module.exports = InspectionImage;
