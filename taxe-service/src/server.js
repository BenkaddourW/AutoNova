// Fichier : taxe-service/app.js (Version Finale avec Correction du Type de Port)

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const taxeRoutes = require('./routes/taxeRoutes');
const errorHandler = require('./middlewares/errorHandler');
const Consul = require("consul");

dotenv.config();

const app = express();

// ✅ CORRECTION : Utiliser parseInt pour s'assurer que PORT est un nombre
const PORT = parseInt(process.env.PORT, 10) || 3009;
const SERVICE_ID = `taxe-service-${PORT}`;
const SERVICE_NAME = "taxe-service";

const consul = new Consul({
  host: process.env.CONSUL_HOST || "localhost",
  port: process.env.CONSUL_PORT || 8500,
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use('/taxes', taxeRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Taxe Service running on http://localhost:${PORT}`);

  const serviceDetails = {
    id: SERVICE_ID,
    name: SERVICE_NAME,
    address: "localhost",
    // ✅ Le PORT est maintenant un nombre, ce qui est correct pour Consul
    port: PORT, 
    check: {
      http: `http://localhost:${PORT}/health`,
      interval: '10s',
      timeout: '5s',
      deregistercriticalserviceafter: '1m'
    }
  };

  consul.agent.service.register(serviceDetails, (err) => {
    if (err) {
      console.error("Échec de l'enregistrement du service auprès de Consul", err);
      // Il est préférable de ne pas faire planter l'application ici, juste de logger l'erreur.
      // throw new Error(err); 
    } else {
      console.log(`Service '${SERVICE_NAME}' enregistré avec succès auprès de Consul.`);
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

process.on('SIGINT', () => {
  console.log(`Désenregistrement du service '${SERVICE_NAME}' de Consul...`);
  consul.agent.service.deregister(SERVICE_ID, (err) => {
    if (err) console.error("Échec du désenregistrement de Consul", err);
    else console.log("Service désenregistré.");
    process.exit();
  });
});
