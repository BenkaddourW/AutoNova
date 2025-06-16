const Consul = require("consul");
const consul = new Consul({
  host: "127.0.0.1",
  port: 8500,
  promisify: true, // pour utiliser async/await
});

async function runTest() {
  console.log("📌 Script de test Consul démarré...");

  // Étape 1 : Enregistrement du service
  const service = {
    id: "service-test-autonova",
    name: "autonova-service",
    address: "127.0.0.1",
    port: 3000,
  };

  // try {
  //   await consul.agent.service.register(service);
  //   console.log(`✅ Service "${service.name}" enregistré avec succès.`);
  // } catch (err) {
  //   console.error("❌ Échec de l'enregistrement :", err.message);
  //   return;
  // }

  // Étape 2 : Récupération de la liste des services
  try {
    const services = await consul.agent.service.list();
    console.log("📋 Services enregistrés :", Object.keys(services));
  } catch (err) {
    console.error(
      "❌ Erreur lors de la récupération des services :",
      err.message
    );
  }

  // Étape 3 : Nettoyage (dérégistre le service pour le test)
  // try {
  //   await consul.agent.service.deregister(service.id);
  //   console.log(`🧹 Service "${service.id}" supprimé après test.`);
  // } catch (err) {
  //   console.error("⚠️ Erreur lors de la suppression du service :", err.message);
  // }

  console.log("✅ Test terminé.");
  process.exit();
}

runTest();
