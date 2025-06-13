const express = require("express");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const Consul = require("consul");

const app = express();
const consul = new Consul();

app.use(express.json());
app.use(helmet()); // Intégration de helmet pour la sécurité

function getServiceUrl(serviceName, cb) {
  consul.agent.service.list((err, services) => {
    if (err) return cb(err);
    for (let id in services) {
      if (services[id].Service === serviceName) {
        const service = services[id];
        return cb(null, `http://${service.Address}:${service.Port}`);
      }
    }
    cb(new Error("Service not found"));
  });
}

app.use("/auth", (req, res, next) => {
  getServiceUrl("auth-service", (err, url) => {
    if (err) return res.status(502).send("Service auth-service indisponible");
    createProxyMiddleware({
      target: url,
      changeOrigin: true,
      pathRewrite: { "^/auth": "" },
    })(req, res, next);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API Gateway démarrée sur le port ${PORT}`);
});
