const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Contrat = sequelize.define(
  "Contrat",
  {
    idcontrat: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numerocontrat: {
      type: DataTypes.STRING,
      //allowNull: false,
      unique: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    montant: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0 },
    },
    montantttc: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0 },
    },
    statut: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    taxes: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      validate: { min: 0 },
    },
    idreservation: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dateretourprevue: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateretour: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    montantpenalite: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
    montantremboursement: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
    },
  },
  {
    tableName: "contrat",
    timestamps: false,
  }
);

// Génération automatique du numéro de contrat avant création
Contrat.beforeCreate((contrat, options) => {
  console.log("Hook beforeCreate exécuté");
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  const randomPart = Math.floor(Math.random() * 10000);
  contrat.numerocontrat = `CTR-${datePart}-${randomPart}`;
});

module.exports = Contrat;
console.log("Modèle Contrat chargé avec succès");
