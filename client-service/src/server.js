const express = require("express");
const app = express();
const PORT = process.env.PORT || 3008;
const clientRoutes = require("./routes/clientRoutes");
const jwtMiddleware = require("./middlewares/jwtMiddleware");
require("dotenv").config();
const Consul = require("consul");
const consul = new Consul({ host: "localhost", port: 8500 });

app.use(express.json());
app.use(jwtMiddleware);
app.use("/", clientRoutes);

app.get("/health", (req, res) => res.status(200).send("OK"));

// Enregistrement auprès de Consul

const SERVICE_ID = "client-service-" + process.pid;

consul.agent.service.register(
  {
    id: SERVICE_ID,
    name: "client-service",
    address: "localhost", // ou l'adresse IP de la machine
    port: Number(PORT),
    check: {
      http: `http://localhost:${PORT}/health`,
      interval: "10s",
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

// Dé-enregistrement à l'arrêt du process
process.on("SIGINT", () => {
  consul.agent.service.deregister(SERVICE_ID, () => {
    process.exit();
  });
});

app.listen(PORT, () => {
  console.log(`Client Service running on http://localhost:${PORT}`);
});
