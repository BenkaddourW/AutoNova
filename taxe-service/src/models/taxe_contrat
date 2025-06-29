module.exports = (sequelize, DataTypes) => {
  const TaxesContrat = sequelize.define(
    "TaxesContrat",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      idcontrat: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idtaxe: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      denomination_appliquee: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      abrege_applique: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      taux_applique: {
        type: DataTypes.DECIMAL(6, 3),
        allowNull: true,
      },
      montant_taxe: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      tableName: "taxes_contrat",
      timestamps: false,
    }
  );
  return TaxesContrat;
};
