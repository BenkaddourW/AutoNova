const dotenv = require("dotenv");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const vehiculeRoutes = require("./routes/vehiculeRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authenticateToken = require("./middlewares/authMiddleware");

const Consul = require("consul");
const consul = new Consul({ host: "localhost", port: 8500 });

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

// Enregistrement auprès de Consul
const serviceId = "vehicule-service-" + process.pid;

consul.agent.service.register(
  {
    id: serviceId,
    name: "vehicule-service",
    address: "localhost",
    port: Number(PORT),
  },
  (err) => {
    if (err) throw err;
    console.log("vehicule-service enregistré auprès de Consul");
  }
);

// Désenregistrement à l'arrêt du process
process.on("exit", () => {
  consul.agent.service.deregister(serviceId, () => {
    console.log("vehicule-service désenregistré de Consul");
  });
});

app.listen(PORT, () => {
  console.log(`Vehicule Service running on http://localhost:${PORT}`);
});
