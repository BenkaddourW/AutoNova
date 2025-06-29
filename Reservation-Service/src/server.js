const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const reservationRoutes = require("./routes/reservationRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authenticateToken = require("./middlewares/authMiddleware");
const Consul = require("consul");
const consul = new Consul({ host: "localhost", port: 8500 });

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Protège toutes les routes du CRUD
// router.use(authenticateToken);

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/reservations", reservationRoutes);

app.use(errorHandler);

// Healthcheck pour Consul
app.get("/health", (req, res) => res.status(200).send("OK"));

// Enregistrement auprès de Consul
const SERVICE_ID = "reservation-service-" + process.pid;

consul.agent.service.register(
  {
    id: SERVICE_ID,
    name: "reservation-service",
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
      console.log("Service reservation-service enregistré auprès de Consul !");
    }
  }
);

// Dé-enregistrement à l'arrêt du process
process.on("SIGINT", () => {
  consul.agent.service.deregister(SERVICE_ID, (err) => {
    if (err) {
      console.error("Erreur lors du désenregistrement :", err);
    } else {
      console.log("Service désenregistré de Consul.");
    }
    process.exit();
  });
});

app.listen(PORT, () => {
  console.log(`Reservation Service running on http://localhost:${PORT}`);
});
