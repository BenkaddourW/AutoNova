const { spawn } = require("child_process");

const services = [
  { name: "auth-service", path: "AutoNova/auth-service" },
  //{ name: "client-service", path: "AutoNova/client-service" },
  { name: "vehicule-service", path: "AutoNova/vehicule-service" },
  { name: "reservation-service", path: "AutoNova/reservation-service" },
  { name: "api-gateway", path: "AutoNova/api-gateway" },
];

services.forEach((service) => {
  const proc = spawn("npm", ["run", "dev"], {
    cwd: `./${service.path}`,
    stdio: "inherit",
  });
  proc.on("close", (code) => {
    console.log(`${service.name} exited with code ${code}`);
  });
});
console.log(
  "Tous les services ont été démarrés. Vous pouvez maintenant accéder à l'API Gateway sur http://localhost:3000"
);
console.log(
  "Pour arrêter tous les services, utilisez Ctrl+C dans le terminal."
);
