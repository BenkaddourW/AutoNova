require("dotenv").config();
const { Sequelize } = require("sequelize");

/**
 * Configuration Sequelize
 * ----------------------
 * Initialise la connexion à la base de données PostgreSQL via Sequelize.
 * Utilise les variables d'environnement pour la sécurité.
 */

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

module.exports = sequelize;
