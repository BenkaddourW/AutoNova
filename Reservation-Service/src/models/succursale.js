const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Succursale = sequelize.define(
  "Succursale",
  {
    idsuccursale: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "succursale",
    timestamps: false,
  }
);

module.exports = Succursale;