module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define(
    "Client",
    {
      idclient: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      codeclient: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      numeropc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paysdelivrance: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      autoritedelivrance: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      datenaissance: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      dateexpiration: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      idutilisateur: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "utilisateur",
          key: "idutilisateur",
        },
      },
    },
    {
      tableName: "client",
      timestamps: false,
    }
  );

  // Hook pour générer automatiquement codeclient
  Client.beforeCreate(async (client, options) => {
    console.log("HOOK beforeCreate appelé !");
    const random = Math.floor(1000 + Math.random() * 9000);
    client.codeclient = `CLT${Date.now()}${random}`;
  });

  return Client;
};
