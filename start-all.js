const { spawn } = require("child_process");

const services = [
  { name: "auth-service", cmd: "npm", args: ["run", "dev"], cwd: "./auth-service" },
  { name: "client-service", cmd: "npm", args: ["run", "dev"], cwd: "./client-service" },
  { name: "dashboard-service", cmd: "npm", args: ["run", "dev"], cwd: "./dashboard-service" },
  { name: "inspectionvehicle-service", cmd: "npm", args: ["run", "dev"], cwd: "./inspectionvehicle-service" },
  { name: "reservation-service", cmd: "npm", args: ["run", "dev"], cwd: "./Reservation-Service" },
  { name: "succursale-service", cmd: "npm", args: ["run", "dev"], cwd: "./succursale-service" },
  { name: "taxe-service", cmd: "npm", args: ["run", "dev"], cwd: "./taxe-service" },
  { name: "vehicule-service", cmd: "npm", args: ["run", "dev"], cwd: "./vehicule-service" },
  { name: "api-gateway", cmd: "npm", args: ["run", "dev"], cwd: "./api-gateway" },
  { name: "client-frontend", cmd: "npm", args: ["run", "dev"], cwd: "./client-frontend" },
  // { name: "admin-frontend", cmd: "npm", args: ["run", "dev"], cwd: "./admin-frontend" },
];

services.forEach(({ name, cmd, args, cwd }) => {
  const proc = spawn(cmd, args, { cwd, shell: true });

  proc.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  proc.stderr.on("data", (data) => {
    process.stderr.write(`[${name} ERROR] ${data}`);
  });

  proc.on("close", (code) => {
    console.log(`[${name}] exited with code ${code}`);
  });
});
