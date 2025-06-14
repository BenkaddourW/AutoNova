const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const reservationRoutes = require("./routes/reservationRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/reservations", reservationRoutes);

app.listen(PORT, () => {
  console.log(`Reservation Service running on http://localhost:${PORT}`);
});
