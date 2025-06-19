const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vehicule = sequelize.define(
  "Vehicule",
  {
    idvehicule: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    immatriculation: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    marque: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    modele: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    categorie: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['Compacte', 'Berline', 'SUV', 'Camionnette']]
      }
    },
    transmission: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    energie: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    couleur: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    statut: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        isIn: [['disponible', 'en_location', 'en_maintenance', 'hors_service']]
      }
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 }
    },
    sieges: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 9 }
    },
    typeentrainement: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    tarifjournalier: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 }
    },
    montantcaution: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0, max: 99999 }
    },
    succursaleidsuccursale: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
  },
  {
    tableName: "vehicule",
    timestamps: false,
  }
);

// --- SUPPRESSION ---
// On retire la ligne Vehicule.hasMany d'ici.
// Elle sera définie dans le fichier vehicule_image.js

module.exports = Vehicule;