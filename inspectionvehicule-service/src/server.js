const dotenv = require("dotenv");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const inspectionRoutes = require("./routes/inspectionRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authenticateToken = require("./middlewares/authMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

// router.use(authenticateToken); // Uncomment to protect routes

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/inspections", inspectionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`InspectionVehicule Service running on http://localhost:${PORT}`);
});