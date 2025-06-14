const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Client = sequelize.define(
  "Client",
  {
    idclient: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "client",
    timestamps: false,
  }
);

module.exports = Client;
