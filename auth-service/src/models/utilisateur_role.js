const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Utilisateur = sequelize.define(
  "utilisateur",
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
    estactif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    datecreation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
      allowNull: true,
    },
    adresse2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    codepostal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numerotelephone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numeromobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "utilisateur",
    timestamps: false,
  }
);

module.exports = Utilisateur;
