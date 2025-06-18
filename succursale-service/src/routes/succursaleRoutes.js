const express = require("express");
const router = express.Router();
const succursaleController = require("../controllers/succursaleController");



const validate = require("../middlewares/validate");
const {createSuccursaleRules,updateSuccursaleRules,} = require("../validators/succursaleValidator");

router.get('/count', succursaleController.getSuccursaleCount);
router.get('/next-code', succursaleController.getNextCode);

router.get("/", succursaleController.getSuccursales);
router.get("/:id", succursaleController.getSuccursaleById);
router.post("/",createSuccursaleRules,validate,succursaleController.createSuccursale);
router.put("/:id",updateSuccursaleRules,validate,succursaleController.updateSuccursale);

// router.post("/", succursaleController.createSuccursale);
// router.put("/:id", succursaleController.updateSuccursale);
router.delete("/:id", succursaleController.deleteSuccursale);

module.exports = router;
