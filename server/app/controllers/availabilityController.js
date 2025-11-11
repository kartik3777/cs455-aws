const dailyAvailabilityModel = require("../models/DailyAvailability");
const tripModel = require("../models/Trip");
const catchAsync = require("../utils/catchAsync");


exports.getAvailability = catchAsync(async (req, res, next) => {
  const { tripId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ status: "fail", message: "Date is required" });
  }

  const travelDate = new Date(date);
  travelDate.setHours(0, 0, 0, 0);

  // 1️⃣ Check if trip exists
  const trip = await tripModel.Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ status: "fail", message: "Trip not found" });
  }

  // 2️⃣ Find daily availability record
  const daily = await dailyAvailabilityModel.DailyAvailability.findOne({
    tripId,
    date: travelDate,
  });

  const bookedSeats = daily ? daily.bookedSeats : 0;
  const availableSeats = trip.totalSeats - bookedSeats;

  res.status(200).json({
    status: "success",
    data: {
      tripId,
      date: travelDate,
      availableSeats,
      totalSeats: trip.totalSeats,
      bookedSeats,
    },
  });
});
