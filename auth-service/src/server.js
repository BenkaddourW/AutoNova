const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const Consul = require("consul");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);

// Enregistrement auprès de Consul
const consul = new Consul();
const serviceId = "auth-service-" + process.pid;

consul.agent.service.register(
  {
    id: serviceId,
    name: "auth-service",
    address: "localhost", // adapte si besoin (ex: IP du conteneur)
    port: Number(PORT),
  },
  (err) => {
    if (err) throw err;
    console.log("auth-service enregistré auprès de Consul");
  }
);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});

// Désenregistrement à l'arrêt du process
process.on("exit", () => {
  consul.agent.service.deregister(serviceId, () => {
    console.log("auth-service désenregistré de Consul");
  });
});
