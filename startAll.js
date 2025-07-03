const { spawn } = require("child_process");
const path = require("path");

const services = [
  { name: "api-gateway", cwd: path.join(__dirname, "api-gateway") },
  { name: "auth-service", cwd: path.join(__dirname, "auth-service") },
  { name: "client-frontend", cwd: path.join(__dirname, "client-frontend") },
  { name: "admin-frontend", cwd: path.join(__dirname, "admin-frontend") },
  { name: "client-service", cwd: path.join(__dirname, "client-service") },
  { name: "dashboard-service", cwd: path.join(__dirname, "dashboard-service") },
  {
    name: "Reservation-Service",
    cwd: path.join(__dirname, "Reservation-Service"),
  },
  {
    name: "succursale-service",
    cwd: path.join(__dirname, "succursale-service"),
  },
  { name: "taxe-service", cwd: path.join(__dirname, "taxe-service") },
  {
    name: "utilisateur-service",
    cwd: path.join(__dirname, "utilisateur-service"),
  },
  { name: "vehicule-service", cwd: path.join(__dirname, "vehicule-service") },
  { name: "paiement-service", cwd: path.join(__dirname, "paiement-service") },
  { name: "contrat-service", cwd: path.join(__dirname, "contrat-service") },
];

console.log("Starting all services...");

services.forEach((service) => {
  const cmd = "npm";
  const args = ["start"];
  const cwd = service.cwd;

  console.log(`[${service.name}] CMD: ${cmd} ARGS: ${args} CWD: ${cwd}`);

  const child = spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("error", (err) => {
    console.error(`[${service.name}] Failed to start:`, err);
  });
});
