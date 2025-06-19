const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Vehicule = require("./vehicule");

const VehiculeImage = sequelize.define(
  "VehiculeImage", // C'est le nom du modèle dans Sequelize, il peut rester en PascalCase.
  {
    // Les définitions des champs restent les mêmes
    idimage: { // Le nom du champ doit correspondre à votre BDD
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'idimage' 
    },
    urlimage: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'urlimage'
    },
    estprincipale: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'estprincipale'
    },
    idvehicule: { // Le nom de la clé étrangère
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'idvehicule', // Assurez-vous que le nom du champ dans la BDD est correct
      references: {
        model: Vehicule,
        key: 'idvehicule'
      }
    }
  },
  {
    // --- CORRECTION DÉFINITIVE ---
    // On utilise le nom exact de la table tel que défini dans votre schéma SQL.
    tableName: "imagevehicule",
    timestamps: false
  }
);

// Définition des associations
// La clé étrangère dans `imagevehicule` est `idvehicule`.
VehiculeImage.belongsTo(Vehicule, { 
    foreignKey: 'idvehicule' 
});

// La clé étrangère dans `imagevehicule` est `idvehicule`.
Vehicule.hasMany(VehiculeImage, { 
    foreignKey: 'idvehicule',
    as: 'VehiculeImages' // L'alias pour les requêtes `include`
});

module.exports = VehiculeImage;
