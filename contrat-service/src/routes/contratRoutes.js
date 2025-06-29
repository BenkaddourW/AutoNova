const express = require("express");
const router = express.Router();
const contratController = require("../controllers/contratController");
const {
  authenticateToken,
  isEmployeOrAdmin,
  isClient,
  authorize,
} = require("../middlewares/contratMiddleware");

// Toutes les routes nécessitent l'authentification
router.use(authenticateToken);

// Employé/Admin : créer, modifier, supprimer, lister tous les contrats
router.post("/", isEmployeOrAdmin, contratController.creerContrat);

router.patch(
  "/:id/statut",
  isEmployeOrAdmin,
  contratController.majStatutContrat
);

// Lister tous les contrats (employé/admin)
router.get("/", isEmployeOrAdmin, contratController.listerContrats);

// Client : lister ses propres contrats
router.get("/mes-contrats", isClient, contratController.listerContratsClient);

// Route pour obtenir un contrat par ID
router.get("/:id", isEmployeOrAdmin, contratController.getContratById);

// router.put("/:id", isEmployeOrAdmin, contratController.modifierContrat);
// router.delete("/:id", isEmployeOrAdmin, contratController.supprimerContrat);

// router.get("/search", isEmployeOrAdmin, contratController.rechercherContrats);

// // Tous (mais contrôle dans le contrôleur pour accès client à ses contrats uniquement)
// router.get("/:id", authorize, contratController.getContratById);

// // Pénalités
// router.post(
//   "/:id/penalites",
//   isEmployeOrAdmin,
//   contratController.ajouterPenalite
// );
// router.get("/:id/penalites", authorize, contratController.listerPenalites);

// // Inspections
// router.post(
//   "/:id/inspections",
//   isEmployeOrAdmin,
//   contratController.creerInspection
// );
// router.get("/:id/inspections", authorize, contratController.listerInspections);
// router.get(
//   "/vehicule/:idvehicule/derniere-inspection",
//   isEmployeOrAdmin,
//   contratController.derniereInspectionVehicule
// );

// // Validation du contrat
// router.post("/:id/valider", isEmployeOrAdmin, contratController.validerContrat);

// // Génération de facture (optionnel)
// router.get("/:id/facture", authorize, contratController.genererFactureContrat);

module.exports = router;
