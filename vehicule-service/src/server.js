const dotenv = require("dotenv");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const vehiculeRoutes = require("./routes/vehiculeRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authenticateToken = require("./middlewares/authMiddleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
// Protège toutes les routes du CRUD
// router.use(authenticateToken);

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/vehicules", vehiculeRoutes);

// Gestion centralisee des erreurs
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Vehicule Service running on http://localhost:${PORT}`);
});
