const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Penalite = sequelize.define(
  "Penalite",
  {
    idpenalite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codepenalite: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    typepenalite: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "penalite",
    timestamps: false,
  }
);

module.exports = Penalite;
