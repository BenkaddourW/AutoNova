// src/models/Utilisateur.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Utilisateur extends Model {
    static associate(models) {
      // Un utilisateur peut avoir plusieurs rôles
      this.belongsToMany(models.Role, {
        through: 'utilisateur_role',
        foreignKey: 'idutilisateur',
        otherKey: 'idrole',
        timestamps: false,
      });
    }
  }

  Utilisateur.init({
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
    // ... gardez tous vos autres champs ici
    nom: { type: DataTypes.STRING, allowNull: false },
    prenom: { type: DataTypes.STRING, allowNull: false },
    adresse1: DataTypes.STRING,
    // etc.
  }, {
    sequelize,
    modelName: 'Utilisateur',
    tableName: 'utilisateur',
    timestamps: false,
  });

  return Utilisateur;
};