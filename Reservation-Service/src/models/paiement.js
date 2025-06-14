const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Paiement = sequelize.define(
  "Paiement",
  {
    idpaiement: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "paiement",
    timestamps: false,
  }
);

module.exports = Paiement;
