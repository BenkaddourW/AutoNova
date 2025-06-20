module.exports = (sequelize, DataTypes) => {
  const Vehicule = sequelize.define("Vehicule", {
    idvehicule: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    // Autres champs ici
  }, {
    tableName: "vehicule",
    timestamps: false,
  });

  return Vehicule;
};
