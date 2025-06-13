const dotenv = require("dotenv");
const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const succursaleRoutes = require("./routes/succursaleRoutes");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.use("/api/succursales", succursaleRoutes);


app.listen(PORT, () => {
  console.log(`Vehicule Service running on http://localhost:${PORT}`);
});