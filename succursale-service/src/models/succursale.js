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
      unique: true,
validate: { len: [1, 20] }
    },
    nomsuccursale: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 50] }
    },
    adresse1: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 100] }

    },
    adresse2: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { len: [1, 100] }
    },
    ville: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 50] }
    },
    codepostal: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 10] }
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 50] }
    },
    pays: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 50] }

    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [1, 20] }
    }
  },
  {
    tableName: "succursale",
    timestamps: false
  }
);

module.exports = Succursale;

