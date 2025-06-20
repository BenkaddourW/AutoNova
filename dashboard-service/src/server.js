// Fichier serveur principal du dashboard-service

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const Consul = require('consul');

const consul = new Consul({ host: 'localhost', port: 8500 });

// SEULEMENT la route pour agréger les données du dashboard
const dashboardRouter = require('./routes/dashboard');

const app = express();
const port = process.env.PORT || 3010; // Utilise le port 3010 de votre .env

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// La seule route que ce service expose
app.use('/dashboards', dashboardRouter);

// Enregistrement auprès de Consul
const serviceId = 'dashboard-service-' + process.pid;

consul.agent.service.register(
  {
    id: serviceId,
    name: 'dashboard-service',
    address: 'localhost',
    port: Number(port),
  },
  (err) => {
    if (err) throw err;
    console.log('dashboard-service enregistré auprès de Consul');
  }
);

// Désenregistrement à l'arrêt du process
process.on('exit', () => {
  consul.agent.service.deregister(serviceId, () => {
    console.log('dashboard-service désenregistré de Consul');
  });
});


app.listen(port, () => {
  console.log(`✅ Dashboard Aggregator Service listening on port ${port}`);
});