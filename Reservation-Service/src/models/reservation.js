module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      idreservation: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      numeroreservation: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      // ... autres champs ...
    },
    {
      tableName: "reservation",
      timestamps: false,
    }
  );

  // Hook pour générer automatiquement le numéro de réservation
  Reservation.beforeCreate(async (reservation, options) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    reservation.numeroreservation = `RES${Date.now()}${random}`;
  });

  return Reservation;
};
