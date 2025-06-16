const http = require("http");

http
  .get("http://127.0.0.1:8500/v1/agent/services", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("Réponse Consul:", data);
    });
  })
  .on("error", (err) => {
    console.error("Erreur HTTP:", err);
  });
