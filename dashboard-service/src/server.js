// Fichier serveur principal du dashboard-service

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

// SEULEMENT la route pour agréger les données du dashboard
const dashboardRouter = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3010; // Utilise le port 3010 de votre .env

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// La seule route que ce service expose
app.use('/api', dashboardRouter);

app.listen(port, () => {
  console.log(`✅ Dashboard Aggregator Service listening on port ${port}`);
});