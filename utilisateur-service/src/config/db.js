// src/config/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Mettre à true pour voir les requêtes SQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Nécessaire pour Supabase/Heroku
    },
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données PostgreSQL réussie.");
  } catch (error) {
    console.error("❌ Impossible de se connecter à la base de données:", error);
    throw error; // Propage l'erreur pour que startServer l'attrape
  }
};

module.exports = { sequelize, connectDB };