// Importer les modules nécessaires
const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk'); // On utilise la librairie chalk pour les couleurs

// 1. Définir les styles de couleur pour les logs
const styles = [
    chalk.blue,
    chalk.green,
    chalk.yellow,
    chalk.magenta,
    chalk.cyan,
    chalk.white,
    chalk.red,
    chalk.gray,
];

// 2. Définir la liste de vos services
// Pour chaque service, on indique son nom, la commande pour le lancer (souvent 'npm start'),
// et son répertoire de travail (cwd).
// NOTE : Sur Windows, il faut utiliser 'npm.cmd' au lieu de 'npm' avec spawn.
const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const services = [
    { name: 'api-gateway', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'api-gateway') },
    { name: 'auth-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'auth-service') },
    { name: 'client-frontend', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'client-frontend') },
    { name: 'admin-frontend', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'admin-frontend') },
    { name: 'client-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'client-service') },
    { name: 'dashboard-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'dashboard-service') },
    { name: 'inspectionvehicule-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'inspectionvehicule-service') },
    { name: 'Reservation-Service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'Reservation-Service') },
    { name: 'succursale-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'succursale-service') },
    { name: 'taxe-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'taxe-service') },
    { name: 'utilisateur-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'utilisateur-service') },
    { name: 'vehicule-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'vehicule-service') },
    { name: 'paiement-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'paiement-service') },
    { name: 'contrat-service', cmd: cmd, args: ['start'], cwd: path.join(__dirname, 'contrat-service') },
    // Ajoutez ici d'autres services si nécessaire
];

console.log('Starting all services...');

// 3. Votre code pour lancer les processus (il est déjà parfait !)
services.forEach(({ name, cmd, args, cwd }, index) => {
    const color = styles[index % styles.length];
    const prefix = color(`[${name}]`);

    const proc = spawn(cmd, args, { cwd });

    proc.stdout.on("data", (data) => {
        process.stdout.write(`${prefix} ${data}`);
    });

    proc.stderr.on("data", (data) => {
        process.stderr.write(`${prefix} ERROR: ${data}`);
    });

    proc.on("close", (code) => {
        console.log(`${prefix} exited with code ${code}`);
    });
});