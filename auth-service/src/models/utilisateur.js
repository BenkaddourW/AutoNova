const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Utilisateur = sequelize.define(
  "Utilisateur",
  {
    idutilisateur: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    motdepasse: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adresse1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    adresse2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codepostal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numerotelephone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numeromobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estactif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    datecreation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "utilisateur",
    timestamps: false,
  }
);

module.exports = Utilisateur;
