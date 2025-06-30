module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define("Client", {
    idclient: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  }, {
    tableName: "client",
    timestamps: false,
  });

  return Client;
};
