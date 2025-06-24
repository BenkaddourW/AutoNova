const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Consul = require("consul");
const jwt = require("jsonwebtoken");
const http = require("http");
const cors = require("cors");
const authenticateJWT = require("./middlewares/authMiddleware");
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

const consul = new Consul({ host: "localhost", port: 8500 });

app.use(cors());
app.use(helmet());

// Protection des routes
app.use("/auth/profile", authenticateJWT);
app.use("/clients", authenticateJWT);

// Fonction pour obtenir l'URL d'un service depuis Consul
function getServiceUrl(serviceName, cb) {
  // ... (votre fonction getServiceUrl reste inchangée)
  console.log("Appel à getServiceUrl pour", serviceName);
  const http = require("http");
  http.get("http://127.0.0.1:8500/v1/agent/services", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const services = JSON.parse(data);
          for (let id in services) {
            if (services[id].Service === serviceName) {
              const service = services[id];
              console.log("Service trouvé:", service.Service, service.Address, service.Port);
              return cb(null, `http://${service.Address}:${service.Port}`);
            }
          }
          console.log("Service non trouvé dans Consul:", serviceName);
          cb(new Error("Service not found"));
        } catch (err) { cb(err); }
      });
    }).on("error", (err) => { console.error("Erreur HTTP Consul:", err); cb(err); });
}

// Option commune pour désactiver le cache
const noCacheOptions = {
  onProxyRes(proxyRes, req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
};

// Route pour le service d'authentification (généralement, on peut le laisser en cache)
app.use("/auth", (req, res, next) => {
  getServiceUrl("auth-service", (err, url) => {
    if (err) return res.status(502).send("Service auth-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/auth" + path, proxyTimeout: 10000 })(req, res, next);
  });
});

// Route pour le service client
app.use("/clients", (req, res, next) => {
  getServiceUrl("client-service", (err, url) => {
    if (err) return res.status(502).send("Service client-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/clients" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Route pour le service de véhicules
app.use("/vehicules", (req, res, next) => {
  getServiceUrl("vehicule-service", (err, url) => {
    if (err) return res.status(502).send("Service vehicule-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/vehicules" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Route pour le service de succursales
app.use("/succursales", (req, res, next) => { 
  getServiceUrl("succursale-service", (err, url) => {
    if (err) return res.status(502).send("Service succursale-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/succursales" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Route pour le service de réservations
app.use("/reservations", (req, res, next) => {
  getServiceUrl("reservation-service", (err, url) => {
    if (err) return res.status(502).send("Service reservation-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/reservations" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Route pour le service de dashboards
app.use("/dashboards", (req, res, next) => {  
  getServiceUrl("dashboard-service", (err, url) => {
    if (err) return res.status(502).send("Service dashboard-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/dashboards" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway démarrée sur le port ${PORT}`);
});
