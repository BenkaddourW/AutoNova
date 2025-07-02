const express = require("express");
const router = express.Router();
const taxeController = require("../controllers/taxeController");
const validate = require("../middlewares/validate");
const {
  createTaxeRules,
  updateTaxeRules,
} = require("../validators/taxeValidator");

router.post("/calculate", taxeController.calculateTaxes);
// Route pour récupérer les taxes par localité
router.get("/localite", taxeController.getTaxesByLocalite);
router.get("/", taxeController.getTaxes);
router.get("/:id", taxeController.getTaxeById);
router.post("/", createTaxeRules, validate, taxeController.createTaxe);
router.put("/:id", updateTaxeRules, validate, taxeController.updateTaxe);
router.delete("/:id", taxeController.deleteTaxe);

// Route pour récupérer les taxes par réservation
router.get("/by-reservation/:id", taxeController.getTaxesByReservationId);

// Route pour récupérer les taxes par contrat
router.get("/by-contrat/:id", taxeController.getTaxesByContratId);

// Route pour enregistrer les taxes associées à un contrat
router.post("/taxes-contrat", taxeController.createTaxesContrat);

module.exports = router;
