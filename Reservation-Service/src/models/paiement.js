// Reservation-Service/src/models/paiement.js (VERSION FINALE ET COMPLÈTE)

module.exports = (sequelize, DataTypes) => {
  const Paiement = sequelize.define(
    "Paiement",
    {
      // ✅ CORRECTION 1: Assurer que la clé primaire est auto-incrémentée
      idpaiement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // ✅ CORRECTION 2: Définir TOUS les champs attendus par la table
      montant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      devise: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "cad",
      },
      typepaiement: {
        type: DataTypes.ENUM("paiement", "remboursement"),
        allowNull: false,
      },
      modepaiement: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'card',
      },
      idintentstripe: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      statutpaiement: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "succeeded",
      },
      idreservation: {
        type: DataTypes.INTEGER,
        allowNull: true, // Peut être lié à une réservation
        references: {
          model: 'reservation',
          key: 'idreservation'
        }
      },
      idcontrat: {
        type: DataTypes.INTEGER,
        allowNull: true, // Ou à un contrat
      },
      datepaiement: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "paiement",
      timestamps: false,
    }
  );

  // Définir l'association pour que l'idempotence fonctionne correctement
  Paiement.associate = (models) => {
    Paiement.belongsTo(models.Reservation, {
      foreignKey: 'idreservation',
      as: 'Reservation'
    });
  };

  return Paiement;
};
