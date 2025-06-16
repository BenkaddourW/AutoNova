const dotenv = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Consul = require("consul");
const jwt = require("jsonwebtoken");
const http = require("http");
const cors = require("cors");
dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

const consul = new Consul({ host: "localhost", port: 8500 });

// Middlewares
//app.use(express.json());
app.use(cors());
app.use(helmet());

// ...le reste du code inchangé...

// Middleware d'authentification JWT pour les routes sensibles
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token invalide ou expiré." });
    }
  } else {
    return res.status(401).json({ message: "Token d'accès requis." });
  }
}

// Exemple : protéger la route /auth/profile
app.use("/auth/profile", authenticateJWT);

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
//Proxy pour le microservice auth-service
// app.use("/auth", (req, res, next) => {
//   getServiceUrl("auth-service", (err, url) => {
//     if (err) return res.status(502).send("Service auth-service indisponible");
//     createProxyMiddleware({
//       target: url,
//       changeOrigin: true,
//       pathRewrite: { "^/auth": "/api/auth" },
//     })(req, res, next);
//   });
// });

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

//test route pour vérifier que l'API Gateway fonctionne
// app.get("/auth", (req, res) => {
//   res.send("API Gateway fonctionne !");
// });

app.listen(PORT, () => {
  console.log(`API Gateway démarrée sur le port ${PORT}`);
});
