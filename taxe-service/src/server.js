const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const taxeRoutes = require("./routes/taxeRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authenticateToken = require("./middlewares/authMiddleware");
const Consul = require("consul");
const consul = new Consul({
  host: process.env.CONSUL_HOST || "localhost",
  port: process.env.CONSUL_PORT || "8500",
  promisify: true,
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

// router.use(authenticateToken);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/taxes", taxeRoutes);
app.use(errorHandler);

// Route de santé pour vérifier que le service est en ligne
app.get("/health", (req, res) => res.status(200).send("OK"));

//Enrgistrement aupres de consul
const serviceId = `taxe-service-${PORT}`;

consul.agent.service.register(
  {
    id: serviceId,
    name: "taxe-service",
    address: process.env.SERVICE_HOST || "localhost",
    port: parseInt(PORT, 10),
    check: {
      http: `http://${process.env.SERVICE_HOST || "localhost"}:${PORT}/health`,
      interval: "20s",
      timeout: "5s",
    },
  },
  (err) => {
    if (err) {
      console.error("Erreur lors de l’enregistrement auprès de Consul:", err);
    } else {
      console.log("Service taxe-service enregistré auprès de Consul");
    }
  }
);

app.listen(PORT, () => {
  console.log(`Taxe Service running on http://localhost:${PORT}`);
});

// Optionnel : se désenregistrer de Consul à l’arrêt du service
process.on("SIGINT", () => {
  consul.agent.service.deregister(serviceId, () => {
    process.exit();
  });
});
