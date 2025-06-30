module.exports = (sequelize, DataTypes) => {
  const Succursale = sequelize.define("Succursale", {
    idsuccursale: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    // Autres champs ici
  }, {
    tableName: "succursale",
    timestamps: false,
  });

  return Succursale;
};
