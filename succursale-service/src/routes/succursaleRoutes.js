const express = require("express");
const router = express.Router();
const succursaleController = require("../controllers/succursaleController");

router.get("/", succursaleController.getSuccursales);
router.get("/:id", succursaleController.getSuccursaleById);
router.post("/", succursaleController.createSuccursale);
router.put("/:id", succursaleController.updateSuccursale);
router.delete("/:id", succursaleController.deleteSuccursale);

module.exports = router;
