module.exports = (sequelize, DataTypes) => {
  const TaxesReservation = sequelize.define(
    "TaxesReservation",
    {
      idtaxe: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "taxe",
          key: "idtaxe",
        },
      },
      idreservation: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "reservation", // ce modèle n'existe pas ici, mais la clé existe en base
          key: "idreservation",
        },
      },
    },
    {
      tableName: "taxes_reservation",
      timestamps: false,
    }
  );

  TaxesReservation.associate = (models) => {
    TaxesReservation.belongsTo(models.Taxe, {
      foreignKey: "idtaxe",
      as: "taxe",
    });
    // Pas de liaison avec Reservation ici, car le modèle n'existe pas dans ce service
  };

  return TaxesReservation;
};
