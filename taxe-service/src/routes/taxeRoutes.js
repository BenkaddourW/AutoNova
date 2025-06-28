const express = require("express");
const router = express.Router();
const taxeController = require("../controllers/taxeController");
const validate = require("../middlewares/validate");
const {
  createTaxeRules,
  updateTaxeRules,
} = require("../validators/taxeValidator");



// Route pour récupérer les taxes par localité
router.get("/localite", taxeController.getTaxesByLocalite);
router.get("/", taxeController.getTaxes);
router.get("/:id", taxeController.getTaxeById);
router.post("/", createTaxeRules, validate, taxeController.createTaxe);
router.put("/:id", updateTaxeRules, validate, taxeController.updateTaxe);
router.delete("/:id", taxeController.deleteTaxe);


module.exports = router;
