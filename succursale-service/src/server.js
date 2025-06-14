const dotenv = require("dotenv");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authenticateToken = require("./middlewares/authMiddleware");
const succursaleRoutes = require("./routes/succursaleRoutes");
const errorHandler = require("./middlewares/errorHandler");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Protège toutes les routes du CRUD
// router.use(authenticateToken);


app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.use("/api/succursales", succursaleRoutes);
app.use(errorHandler);


app.listen(PORT, () => {
  
   console.log(`Succursale Service running on http://localhost:${PORT}`);
});
