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
// app.use("/api/reservations", reservationRoutes);

app.use(errorHandler);

// Enregistrement auprès de Consul
const serviceId = "auth-service-" + process.pid;

consul.agent.service.register(
  {
    id: serviceId,
    name: "reservation-service",
    address: "localhost", // adapter si besoin (ex: IP du conteneur)
    port: Number(PORT),
  },
  (err) => {
    if (err) throw err;
    console.log("reservation-service enregistré auprès de Consul");
  }
);

app.listen(PORT, () => {
  console.log(`Reservation Service running on http://localhost:${PORT}`);
});
