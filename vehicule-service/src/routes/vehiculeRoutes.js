const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authMiddleware");
const vehiculeController = require("../controllers/vehiculeController");


// Protège toutes les routes du CRUD :
// router.use(authenticateToken);

router.get("/", vehiculeController.getVehicules);
router.get("/:id", vehiculeController.getVehiculeById);
router.post("/", vehiculeController.createVehicule);
router.put("/:id", vehiculeController.updateVehicule);
router.delete("/:id", vehiculeController.deleteVehicule);

module.exports = router;
