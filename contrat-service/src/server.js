require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const Consul = require("consul");

const app = express();
const PORT = process.env.PORT || 3015;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Route de santé pour consul (doit être accessible sans authentification)
app.get("/contrats/health", (req, res) => res.status(200).send("OK"));

// Routes principales protégées
app.use("/client/contrats", require("./routes/contratRoutes"));

// Consul registration
const consul = new Consul({
  host: process.env.CONSUL_HOST || "localhost",
  port: process.env.CONSUL_PORT || "8500",
  promisify: true,
});

const serviceId = `contrat-service-${PORT}`;

consul.agent.service.register(
  {
    id: serviceId,
    name: "contrat-service",
    address: process.env.SERVICE_HOST || "localhost",
    port: parseInt(PORT, 10),
    check: {
      http: `http://${
        process.env.SERVICE_HOST || "localhost"
      }:${PORT}/contrats/health`,
      interval: "20s",
      timeout: "5s",
    },
  },
  (err) => {
    if (err) {
      console.error("Erreur lors de l'enregistrement auprès de Consul:", err);
    } else {
      console.log("Service contrat-service enregistré auprès de Consul");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Contrat Service running on http://localhost:${PORT}`);
});

// Optionnel : se désenregistrer de Consul à l’arrêt du service
process.on("SIGINT", () => {
  consul.agent.service.deregister(serviceId, () => {
    process.exit();
  });
});
