// Fichier : src/models/taxes_reservation.js

module.exports = (sequelize, DataTypes) => {
  const TaxesReservation = sequelize.define(
    "TaxesReservation",
    {
      idtaxe: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "taxe", // Fait référence à la table 'taxe'
          key: "idtaxe",
        },
      },
      idreservation: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "reservation", // Fait référence à la table 'reservation'
          key: "idreservation",
        },
      },
    },
    {
      tableName: "taxes_reservation",
      timestamps: false,
    }
  );

  // On définit l'association pour que les requêtes 'include' fonctionnent
  TaxesReservation.associate = (models) => {
    TaxesReservation.belongsTo(models.Taxe, {
      foreignKey: "idtaxe",
      as: "taxe",
    });
  };

  return TaxesReservation;
};
