// Fichier : paiement-service/src/models/paiement.js

module.exports = (sequelize, DataTypes) => {
  const Paiement = sequelize.define(
    "Paiement",
    {
      idpaiement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      montant: {
        type: DataTypes.DECIMAL(8, 2),
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

      // ✅✅✅ LA CORRECTION CRUCIALE EST ICI ✅✅✅
      // On ajoute la définition de la colonne manquante pour que Sequelize la reconnaisse.
      modepaiement: {
        type: DataTypes.STRING,
        allowNull: false, // Doit correspondre à la contrainte NOT NULL de la BDD
      },
      

      idintentstripe: {
        type: DataTypes.STRING,
        allowNull: false, // ou true si certains paiements n'ont pas d'intent
      },
      statutpaiement: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "succes",
      },
      idreservation: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      idcontrat: {
        type: DataTypes.INTEGER,
        allowNull: true,
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

  return Paiement;
};
