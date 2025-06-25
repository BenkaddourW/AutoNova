const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TaxeLocalite = sequelize.define(
  "TaxeLocalite",
  {
    idtaxe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "taxe",
        key: "idtaxe",
      },
    },
    pays: {
      type: DataTypes.STRING(5),
      primaryKey: true,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      allowNull: true, // NULL si la taxe est nationale
    },
  },
  {
    tableName: "taxe_localite",
    timestamps: false,
  }
);

module.exports = TaxeLocalite;
