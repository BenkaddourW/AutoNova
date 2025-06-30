const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inspection = sequelize.define(
  "Inspection",
  {
    idinspection: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dateinspection: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    kilometrage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    niveaucarburant: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proprete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    typeinspection: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idvehicule: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idcontrat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "inspection",
    timestamps: false,
  }
);

module.exports = Inspection;
