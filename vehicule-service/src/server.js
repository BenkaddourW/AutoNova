const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const vehiculeRoutes = require("./routes/vehiculeRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authenticateToken = require("./middlewares/authMiddleware");
const Consul = require("consul");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
// Protège toutes les routes du CRUD
// router.use(authenticateToken);

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/vehicules", vehiculeRoutes);

// Gestion centralisee des erreurs
app.use(errorHandler);

// Healthcheck pour Consul
app.get("/health", (req, res) => res.status(200).send("OK"));

// Enregistrement auprès de Consul
const consul = new Consul({ host: "localhost", port: 8500 });
const SERVICE_ID = "vehicule-service-" + process.pid;

consul.agent.service.register(
  {
    id: SERVICE_ID,
    name: "vehicule-service",
    address: "localhost", // ou l'adresse IP de la machine
    port: Number(PORT),
    check: {
      http: `http://localhost:${PORT}/health`,
      interval: "20s",
    },
  },
  (err) => {
    if (err) {
      console.error(
        "Erreur lors de l'enregistrement du service auprès de Consul:",
        err
      );
    } else {
      console.log("Service vehicule-service enregistré auprès de Consul !");
    }
  }
);

// Désenregistrement à l'arrêt du process
process.on("SIGINT", () => {
  consul.agent.service.deregister(SERVICE_ID, () => {
    process.exit();
  });
});

app.listen(PORT, () => {
  console.log(`Vehicule Service running on http://localhost:${PORT}`);
});
