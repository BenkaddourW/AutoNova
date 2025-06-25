const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContratPenalite = sequelize.define(
  "ContratPenalite",
  {
    idcontrat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "contrat",
        key: "idcontrat",
      },
    },
    idpenalite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "penalite",
        key: "idpenalite",
      },
    },
    montantbase: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    quantite: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    tableName: "contrat_penalite",
    timestamps: false,
  }
);

module.exports = ContratPenalite;
