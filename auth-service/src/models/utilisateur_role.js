const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UtilisateurRole = sequelize.define(
  "UtilisateurRole",
  {
    idutilisateur: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    idrole: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "utilisateur_role",
    timestamps: false,
  }
);

module.exports = UtilisateurRole;
