const express = require("express");
const tripController = require("../controllers/tripController");
const { protect } = require("../controllers/userauthController");

const router = express.Router();

// Only logged-in providers can add trips
router.post("/add", tripController.addTrip);
router.get("/date/:date", tripController.getTripsByDateUser);
// Get trips of the logged-in provider
router.get("/provider/:id", tripController.getProviderTrips);
// router.get("/by-date/:date", tripController.getTripsByDate);
router.get("/provider/:providerId/by-date/:date", tripController.getProviderTripsByDate);
router.get("/provider/:tripId/customers/:travelDate", tripController.getTripCustomersByDate);
// ✅ Get a single trip by ID
router.get("/:id", tripController.getTripById);
// ✅ Update a trip by ID
router.put("/:id", tripController.updateTrip);
// Delete (cancel) a trip (provider only)
router.delete("/:id", tripController.deleteTrip);

module.exports = router;



// exports.getAllTrips = catchAsync(async (req, res, next) => {
//   // 1️⃣ Determine which date to show (today by default)
//   const queryDate = req.query.date ? new Date(req.query.date) : new Date();
//   queryDate.setHours(0, 0, 0, 0);

//   // 2️⃣ Get all scheduled trips
//   const trips = await tripModel.Trip.find({ status: "scheduled" })
//     .populate("providerId", "companyName rating")
//     .lean();

//   // 3️⃣ For each trip, fetch its availability for the requested date
//   const tripsWithAvailability = await Promise.all(
//     trips.map(async (trip) => {
//       const availability = await dailyAvailabilityModel.DailyAvailability.findOne({
//         tripId: trip._id,
//         date: queryDate,
//       });

//       const bookedSeats = availability ? availability.bookedSeats : 0;
//       const availableSeats = trip.totalSeats - bookedSeats;

//       return {
//         ...trip,
//         availableSeats,
//         bookedSeats,
//         travelDate: queryDate,
//       };
//     })
//   );

//   res.status(200).json({
//     status: "success",
//     results: tripsWithAvailability.length,
//     data: { trips: tripsWithAvailability },
//   });
// });

// // 🟢 Generic helper to get trips by mode
// const getTripsByMode = async (mode) => {
//   const trips = await tripModel.Trip.find({
//     mode,
//     status: "scheduled",
//   })
//     .populate("providerId", "companyName rating")
//     .sort({ "dynamicPricing.multiplier": -1 });

//   return trips;
// };

// // 🟢 Flights
// exports.getAvailableFlights = catchAsync(async (req, res, next) => {
//   const flights = await getTripsByMode("flight");
//   res.status(200).json({
//     status: "success",
//     results: flights.length,
//     data: { trips: flights },
//   });
// });

// // 🟢 Trains
// exports.getAvailableTrains = catchAsync(async (req, res, next) => {
//   const trains = await getTripsByMode("train");
//   res.status(200).json({
//     status: "success",
//     results: trains.length,
//     data: { trips: trains },
//   });
// });

// // 🟢 Buses
// exports.getAvailableBuses = catchAsync(async (req, res, next) => {
//   const buses = await getTripsByMode("bus");
//   res.status(200).json({
//     status: "success",
//     results: buses.length,
//     data: { trips: buses },
//   });
// });
