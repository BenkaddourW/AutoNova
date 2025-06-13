const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reservation = sequelize.define(
  "Reservation",
  {
    idreservation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    numeroreservation: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    datereservation: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    daterdv: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateretour: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    montanttotal: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    taxes: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    montantttc: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idclient: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idsuccursalelivraison: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idsuccursaleretour: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idvehicule: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idpaiement: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "reservation",
    timestamps: false,
  }
);

module.exports = Reservation;