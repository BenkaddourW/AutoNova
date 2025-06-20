const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const Consul = require("consul");
const morgan = require("morgan");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);

// Healthcheck pour Consul
app.get("/health", (req, res) => res.status(200).send("OK"));

// Enregistrement auprès de Consul
const consul = new Consul({ host: "localhost", port: 8500 });
const SERVICE_ID = "auth-service-" + process.pid;

consul.agent.service.register(
  {
    id: SERVICE_ID,
    name: "auth-service",
    address: "localhost", // adapter si besoin (ex: IP du conteneur)
    port: Number(PORT),
    check: {
      http: `http://localhost:${PORT}/health`,
      interval: "20s",
    },
  },
  (err) => {
    if (err) throw err;
    console.log("auth-service enregistré auprès de Consul");
  }
);
// Désenregistrement à l'arrêt du process
process.on("exit", () => {
  consul.agent.service.deregister(SERVICE_ID, () => {
    console.log("auth-service désenregistré de Consul");
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});
