const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/create", bookingController.createBooking);
router.post("/my", bookingController.getUserBookings);
router.post("/upcoming", bookingController.getUpcomingBookings);
router.post("/reschedule", bookingController.rescheduleBooking);
router.post("/cancelbooking", bookingController.cancelBooking);

module.exports = router;
