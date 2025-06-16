const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UtilisateurRole = sequelize.define(
  "utilisateur_role",
  {
    idutilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "utilisateur",
        key: "idutilisateur",
      },
    },
    idrole: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "role",
        key: "idrole",
      },
    },
  },
  {
    tableName: "utilisateur_role",
    timestamps: false,
  }
);

module.exports = UtilisateurRole;
