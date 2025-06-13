const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vehicule = sequelize.define(
  "Vehicule",
  {
    idvehicule: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true, // Tu veux auto-incrément comme SERIAL
    },
    immatriculation: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    marque: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modele: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categorie: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transmission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    energie: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    couleur: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sieges: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    typeentrainement: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tarifjournalier: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    montantcaution: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    succursaleidsuccursale: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "vehicule", // Nom de la table dans la base de données
    timestamps: false,
  }
);

module.exports = Vehicule;
