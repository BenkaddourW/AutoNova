const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const Consul = require("consul");
const jwtMiddleware = require("./middlewares/jwtMiddleware");
const clientRoutes = require("./routes/clientRoutes");

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares globaux
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Route de healthcheck (avant le middleware JWT)
app.get("/health", (req, res) => res.status(200).send("OK"));

// Middleware JWT pour toutes les autres routes
app.use(jwtMiddleware);

// Routes du client-service
app.use("/", clientRoutes);

// Enregistrement auprès de Consul
const consul = new Consul({ host: "127.0.0.1", port: 8500 });
const SERVICE_ID = "client-service-" + process.pid;

consul.agent.service.register(
  {
    id: SERVICE_ID,
    name: "client-service",
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
      console.log("Service client-service enregistré auprès de Consul !");
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
  console.log(`Client Service running on http://localhost:${PORT}`);
});
