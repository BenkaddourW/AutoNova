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
      validate: { len: [1, 30] }
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
      validate: { min: 0 }
    },
    taxes: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0 }
    },
    montantttc: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0 }
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['Confirmée', 'Terminée', 'Active', 'Annulée']] }
    },
    idclient: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    idsuccursalelivraison: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    idsuccursaleretour: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    idvehicule: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
    idpaiement: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }
    },
  },
  {
    tableName: "reservation",
    timestamps: false,
  }
);

module.exports = Reservation;
