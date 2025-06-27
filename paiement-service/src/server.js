require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const Consul = require("consul");
const paiementRoutes = require("./routes/paiementRoutes");

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/paiements", paiementRoutes);

app.get("/health", (req, res) => res.status(200).send("OK"));

// Consul registration
const consul = new Consul({ host: "localhost", port: 8500 });
const SERVICE_ID = "paiement-service-" + process.pid;

consul.agent.service.register(
  {
    id: SERVICE_ID,
    name: "paiement-service",
    address: "localhost",
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
      console.log("Service paiement-service enregistré auprès de Consul !");
    }
  }
);

process.on("SIGINT", () => {
  consul.agent.service.deregister(SERVICE_ID, () => {
    process.exit();
  });
});

app.listen(PORT, () => {
  console.log(`Paiement Service running on http://localhost:${PORT}`);
});
