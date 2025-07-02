const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaxeLocalite = sequelize.define(
  "TaxeLocalite",
  {
    idtaxe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    pays: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "taxe_localite",
    timestamps: false,
  }
);

module.exports = TaxeLocalite;
