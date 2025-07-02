const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Employe = sequelize.define(
  "Employe",
  {
    idemploye: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codeemploye: {
      type: DataTypes.STRING,
      unique: true,
    },
    dateembauche: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    datedepart: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    idutilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "utilisateur", // nom de la table, pas le modèle importé
        key: "idutilisateur",
      },
    },
    idsuccursale: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "employe",
    timestamps: false,
    hooks: {
      beforeCreate: async (employe) => {
        if (!employe.codeemploye) {
          employe.codeemploye = `EMP${employe.idutilisateur}_${Date.now()}`;
        }
      },
    },
  }
);

module.exports = Employe;
