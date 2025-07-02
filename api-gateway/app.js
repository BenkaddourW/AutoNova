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

//app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/auth/profile", authenticateJWT);

// Protection des routes sensibles
// Ici, nous allons protéger les routes qui nécessitent une authentification JWT
app.use("/auth/profile", authenticateJWT);
app.use("/clients", authenticateJWT);
app.use("/paiements", authenticateJWT);

// Fonction pour obtenir l'URL d'un service depuis Consul
function getServiceUrl(serviceName, cb) {
  console.log("Appel à getServiceUrl pour", serviceName);
  const http = require("http");
  http
    .get("http://127.0.0.1:8500/v1/agent/services", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const services = JSON.parse(data);
          for (let id in services) {
            if (services[id].Service === serviceName) {
              const service = services[id];
              console.log(
                "Service trouvé:",
                service.Service,
                service.Address,
                service.Port
              );
              return cb(null, `http://${service.Address}:${service.Port}`);
            }
          }
          console.log("Service non trouvé dans Consul:", serviceName);
          cb(new Error("Service not found"));
        } catch (err) {
          cb(err);
        }
      });
    })
    .on("error", (err) => {
      console.error("Erreur HTTP Consul:", err);
      cb(err);
    });
}

// Route pour le service d'authentification
// Cette route va intercepter les requêtes vers /auth et les rediriger vers le service d'authentification
// en utilisant le proxy middleware de http-proxy-middleware

app.use("/auth", (req, res, next) => {
  console.log("Requête reçue:", req.method, req.url);
  console.log("Headers:", req.headers);

  getServiceUrl("auth-service", (err, url) => {
    if (err) {
      console.error("Erreur lors de la récupération du service:", err);
      return res.status(502).send("Service auth-service indisponible");
    }

    console.log("URL cible résolue:", url);

    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/auth" + path,
      proxyTimeout: 10000,
      onProxyReq(proxyReq, req, res) {
        console.log("Proxy request envoyée...");
      },
      onProxyRes(proxyRes, req, res) {
        console.log("Réponse du service reçue:", proxyRes.statusCode);
      },
      onError(err, req, res) {
        console.error("Erreur dans le proxy:", err);
        res.status(502).send("Erreur lors du proxy");
      },
    });
    if (!proxy) {
      console.error("Proxy non créé - URL invalide ?");
      return res.status(502).send("Proxy non initialisé");
    }
    console.log("Exécution du proxy avec URL:", url);
    proxy(req, res, next);
  });
});

// Route pour le service client
app.use("/clients", (req, res, next) => {
  getServiceUrl("client-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service client-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/clients" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

// Route pour le service vehicule
app.use("/vehicules", (req, res, next) => {
  getServiceUrl("vehicule-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service vehicule-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/vehicules" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

// Route pour le service reservation
app.use("/reservations", (req, res, next) => {
  getServiceUrl("reservation-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service reservation-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/reservations" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

// Route pour le service paiement
app.use("/paiements", (req, res, next) => {
  getServiceUrl("paiement-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service paiement-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/paiements" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

// Route pour le service contrat protégée par JWT
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

//Route pour le service succursales
app.use("/succursales", (req, res, next) => {
  getServiceUrl("succursale-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service succursale-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/succursales" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

// Route pour le service taxe
app.use("/taxes", (req, res, next) => {
  getServiceUrl("taxe-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service taxe-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/taxes" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});

// Route pour le service dashboard
app.use("/dashboards", (req, res, next) => {
  getServiceUrl("dashboard-service", (err, url) => {
    if (err) {
      return res.status(502).send("Service dashboard-service indisponible");
    }
    const proxy = createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: (path, req) => "/dashboards" + path,
      proxyTimeout: 10000,
    });
    proxy(req, res, next);
  });
});
