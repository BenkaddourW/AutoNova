require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const Consul = require("consul");
const os = require("os");

// Chemins corrects
const { connectDB } = require("./config/db");
const { sequelize } = require("./models");
const utilisateurRoutes = require("./routes/utilisateurRoutes");

const app = express();
const PORT = process.env.PORT || 3011;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Route de santé
app.get("/health", (req, res) => res.status(200).send("OK"));

// Routes
app.use("/utilisateurs", utilisateurRoutes);

// Création unique du client Consul
const consul = new Consul({ host: "localhost", port: 8500 });

// Nom et ID du service
const SERVICE_NAME = "utilisateur-service"; // NOM correct pour le gateway
const SERVICE_ID = `${SERVICE_NAME}-${PORT}`;

// Adresse IP locale (au lieu de "localhost", utile en conteneur)
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

// Démarrage du serveur
const startServer = async () => {
  try {
    await connectDB();
    console.log("Connexion DB réussie.");

    app.listen(PORT, () => {
      console.log(`🚀 Utilisateur-Service démarré sur le port ${PORT}`);

      const serviceAddress = getLocalIPAddress();

      // Enregistrement auprès de Consul
      const consulInfo = {
        id: SERVICE_ID,
        name: SERVICE_NAME,
        address: serviceAddress,
        port: parseInt(PORT),
        check: {
          http: `http://${serviceAddress}:${PORT}/health`,
          interval: "10s",
          timeout: "5s",
        },
      };

      consul.agent.service.register(consulInfo, (err) => {
        if (err) {
          console.error("❌ Échec de l'enregistrement auprès de Consul:", err);
        } else {
          console.log(`✅ Service '${SERVICE_NAME}' enregistré auprès de Consul.`);
        }
      });
    });

    // Dérégistration propre à l'arrêt
    process.on("SIGINT", () => {
      console.log(`🧹 Dérégistration du service '${SERVICE_ID}'...`);
      consul.agent.service.deregister(SERVICE_ID, (err) => {
        if (err) {
          console.error("❌ Erreur lors de la dérégistration:", err);
        } else {
          console.log(`🛑 Service '${SERVICE_ID}' retiré de Consul.`);
        }
        process.exit();
      });
    });

  } catch (error) {
    console.error("❌ Échec du démarrage du serveur:", error);
    process.exit(1);
  }
};

startServer();
