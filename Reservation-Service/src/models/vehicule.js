const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vehicule = sequelize.define(
  "Vehicule",
  {
    idvehicule: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "vehicule",
    timestamps: false,
  }
);

module.exports = Vehicule;