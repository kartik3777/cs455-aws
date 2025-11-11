const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");

// ✅ GET /api/availability/:tripId?date=YYYY-MM-DD
router.get("/:tripId", availabilityController.getAvailability);

module.exports = router;
