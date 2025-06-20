module.exports = (sequelize, DataTypes) => {
  const Paiement = sequelize.define("Paiement", {
    idpaiement: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    // Autres champs ici
  }, {
    tableName: "paiement",
    timestamps: false,
  });

  return Paiement;
};
