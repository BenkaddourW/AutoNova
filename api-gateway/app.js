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

// Initialisation du client Consul pour la découverte de services
const consul = new Consul({ host: "localhost", port: 8500 });

app.use(cors());
app.use(helmet());

// Middleware de protection JWT pour les routes sensibles
app.use("/auth/profile", authenticateJWT);
app.use("/clients", authenticateJWT);
app.use("/paiements", authenticateJWT);

/**
 * Fonction utilitaire pour obtenir dynamiquement l'URL d'un service enregistré dans Consul.
 * @param {string} serviceName - Nom du service à rechercher.
 * @param {function} cb - Callback recevant (erreur, url).
 */
function getServiceUrl(serviceName, cb) {
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

// Options communes pour désactiver le cache sur les proxys
const noCacheOptions = {
  onProxyRes(proxyRes, req, res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
};

// Proxy vers le service d'authentification (cache autorisé)
app.use("/auth", (req, res, next) => {
  getServiceUrl("auth-service", (err, url) => {
    if (err) return res.status(502).send("Service auth-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/auth" + path, proxyTimeout: 10000 })(req, res, next);
  });
});

// Proxy vers le service client
app.use("/clients", (req, res, next) => {
  getServiceUrl("client-service", (err, url) => {
    if (err) return res.status(502).send("Service client-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/clients" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service de véhicules
app.use("/vehicules", (req, res, next) => {
  getServiceUrl("vehicule-service", (err, url) => {
    if (err) return res.status(502).send("Service vehicule-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/vehicules" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service de succursales
app.use("/succursales", (req, res, next) => { 
  getServiceUrl("succursale-service", (err, url) => {
    if (err) return res.status(502).send("Service succursale-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/succursales" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service de réservations
app.use("/reservations", (req, res, next) => {
  getServiceUrl("reservation-service", (err, url) => {
    if (err) return res.status(502).send("Service reservation-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/reservations" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service de dashboard
app.use("/dashboards", (req, res, next) => {  
  getServiceUrl("dashboard-service", (err, url) => {
    if (err) return res.status(502).send("Service dashboard-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/dashboards" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service de taxes
app.use("/taxes", (req, res, next) => {   
  getServiceUrl("taxe-service", (err, url) => {
    if (err) return res.status(502).send("Service taxe-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/taxes" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service utilisateur
app.use("/utilisateurs", (req, res, next) => {   
  getServiceUrl("utilisateur-service", (err, url) => {
    if (err) return res.status(502).send("Service utilisateur-service indisponible");
    createProxyMiddleware({ target: url, changeOrigin: true, pathRewrite: (path, req) => "/utilisateurs" + path, proxyTimeout: 10000, ...noCacheOptions })(req, res, next);
  });
});

// Proxy vers le service paiement
app.use("/paiements", (req, res, next) => {
  getServiceUrl("paiement-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service paiement-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/paiements" + path,
      proxyTimeout: 30000,
    });
    proxy(req, res, next);
  });
});

// Proxy vers le service contrat, protégé par JWT
app.use("/contrats", authenticateJWT, (req, res, next) => {
  getServiceUrl("contrat-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service contrat-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/contrats" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway démarrée sur le port ${PORT}`);
});
