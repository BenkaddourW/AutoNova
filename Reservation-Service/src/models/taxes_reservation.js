// reservation-service/models/taxes_reservation.js (VERSION CORRIGÉE)

const { DataTypes } = require('sequelize');

// On exporte une fonction qui prendra sequelize en argument
module.exports = (sequelize) => {
  const TaxesReservation = sequelize.define('TaxesReservation', {
    idtaxe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    idreservation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    }
  }, {
    tableName: 'taxes_reservation',
    timestamps: false
  });

  return TaxesReservation;
};
