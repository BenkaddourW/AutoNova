// src/models/Role.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    // Vous pouvez définir les méthodes d'association ici
    static associate(models) {
      // Un rôle peut être attribué à plusieurs utilisateurs
      this.belongsToMany(models.Utilisateur, {
        through: 'utilisateur_role',
        foreignKey: 'idrole',
        otherKey: 'idutilisateur',
        timestamps: false,
      });
    }
  }

  Role.init({
    idrole: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'role',
    timestamps: false,
  });

  return Role;
};