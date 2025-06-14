const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Succursale = sequelize.define(
  "Succursale",
  {
    idsuccursale: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    codeagence: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    nomsuccursale: {
      type: DataTypes.STRING,
      allowNull: false
    },
    adresse1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    adresse2: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codepostal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "succursale",
    timestamps: false
  }
);

module.exports = Succursale;

