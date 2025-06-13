const dotenv = require("dotenv");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const vehiculeRoutes = require("./routes/vehiculeRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));



app.listen(PORT, () => {
  console.log(`Vehicule Service running on http://localhost:${PORT}`);
});