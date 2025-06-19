const express = require("express");
const router = express.Router();
const inspectionController = require("../controllers/inspectionController");
const validate = require("../middlewares/validate");
const { createInspectionRules, updateInspectionRules } = require("../validators/inspectionValidator");


router.get("/contrat/:idcontrat", inspectionController.getInspectionsByContratId);
router.get("/", inspectionController.getInspections);
router.get("/:id", inspectionController.getInspectionById);
router.post("/", createInspectionRules, validate, inspectionController.createInspection);
router.put("/:id", updateInspectionRules, validate, inspectionController.updateInspection);
router.delete("/:id", inspectionController.deleteInspection);

module.exports = router;
