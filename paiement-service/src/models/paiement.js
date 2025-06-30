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
        type: DataTypes.DECIMAL(8, 2), // NUMERIC(8,2) : 8 chiffres, 2 décimales
        allowNull: false,
      },
      modepaiement: {
        type: DataTypes.STRING,
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
      idintentstripe: {
        type: DataTypes.STRING,
        allowNull: false,
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
