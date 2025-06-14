const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

// Protège toutes les routes du CRUD :
// router.use(authenticateToken);

router.get("/", reservationController.getReservations);
router.get("/:id", reservationController.getReservationById);
router.post("/", reservationController.createReservation);
router.put("/:id", reservationController.updateReservation);
router.delete("/:id", reservationController.deleteReservation);

module.exports = router;
