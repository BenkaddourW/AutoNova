const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const TaxeLocalite = require("./taxe_localite"); // Assurez-vous que le chemin est correct

const Taxe = sequelize.define(
  "Taxe",
  {
    idtaxe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    denomination: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [1, 100] },
    },
    abrege: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [1, 50] },
    },
    taux: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
  },
  {
    tableName: "taxe",
    timestamps: false,
  }
);

Taxe.hasMany(TaxeLocalite, { as: "localites", foreignKey: "idtaxe" });

module.exports = Taxe;
