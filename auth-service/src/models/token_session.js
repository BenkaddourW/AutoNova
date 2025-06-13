const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TokenSession = sequelize.define(
  "TokenSession",
  {
    idtoken: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idutilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [["access", "refresh"]],
      },
    },
    dateexpiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ipsource: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    useragent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isrevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    daterevocation: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdat: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "token_session",
    timestamps: false,
  }
);

module.exports = TokenSession;
