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

  // Hook pour générer automatiquement le numéro de réservation
  Reservation.beforeCreate(async (reservation, options) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    reservation.numeroreservation = `RES${Date.now()}${random}`;
  });

    

  return Reservation;
};
