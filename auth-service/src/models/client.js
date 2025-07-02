const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Utilisateur = require("./utilisateur");

const Client = sequelize.define(
  "Client",
  {
    idclient: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codeclient: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    numeropc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paysdelivrance: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    autoritedelivrance: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datenaissance: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateexpiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    idutilisateur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Utilisateur,
        key: "idutilisateur",
      },
    },
  },
  {
    tableName: "client",
    timestamps: false,
  }
);

Client.belongsTo(Utilisateur, { foreignKey: "idutilisateur" });

module.exports = Client;
