const tripModel = require("../models/Trip");
const providerModel = require("../models/Provider");
const bookingModel = require("../models/Booking")
const dailyAvailabilityModel = require("../models/DailyAvailability");
const catchAsync = require("../utils/catchAsync");

// 🟢 Add a new recurring daily trip (Provider)
exports.addTrip = catchAsync(async (req, res, next) => {
  const { mode, source, destination, departureTime, arrivalTime, basePrice, totalSeats, providerId } = req.body;

  const provider = await providerModel.Provider.findById(providerId);
  if (!provider) {
    return res.status(403).json({ message: "Only providers can add trips!" });
  }

  // 1️⃣ Create the trip
  const newTrip = await tripModel.Trip.create({
    providerId: provider._id,
    mode,
    source,
    destination,
    departureTime,
    arrivalTime,
    basePrice,
    totalSeats,
  });

  // 2️⃣ Initialize DailyAvailability for next 7 days
  const today = new Date();
  const availabilityDocs = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    availabilityDocs.push({
      tripId: newTrip._id,
      date,
      bookedSeats: 0,
    });
  }

  await dailyAvailabilityModel.DailyAvailability.insertMany(availabilityDocs);

  res.status(201).json({
    status: "success",
    message: "Trip added successfully with 7-day availability initialized",
    data: { trip: newTrip },
  });
});

//for user to get trips of a date
exports.getTripsByDateUser = catchAsync(async (req, res, next) => {
  const { date } = req.params;
  if (!date) return res.status(400).json({ success: false, message: "Date is required" });

  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);

  // 1️⃣ Get all scheduled trips
  const trips = await tripModel.Trip.find({ status: "scheduled" })
    .populate("providerId", "companyName rating")
    .lean();

  // 2️⃣ For each trip, get availability for this date using $gte/$lt to avoid hour mismatch
  const tripsWithAvailability = await Promise.all(
    trips.map(async (trip) => {
      const availability = await dailyAvailabilityModel.DailyAvailability.findOne({
        tripId: trip._id,
        date: { $gte: queryDate, $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) },
      }).lean();

      const bookedSeats = availability ? availability.bookedSeats : 0;
      const availableSeats = trip.totalSeats - bookedSeats;

      return {
        ...trip,
        bookedSeats,
        availableSeats,
        travelDate: queryDate.toISOString().split("T")[0],
      };
    })
  );

  res.status(200).json({
    success: true,
    results: tripsWithAvailability.length,
    data: { trips: tripsWithAvailability }, // wrap inside trips
  });
});

// 📅 Get all trips for a specific provider & date (for provider dashboard)
exports.getProviderTripsByDate = catchAsync(async (req, res, next) => {
  const { providerId, date } = req.params;

  if (!providerId || !date) {
    return res.status(400).json({
      success: false,
      message: "providerId and date are required",
    });
  }

  // Normalize date range for the entire day (00:00 → 23:59)
  const queryDate = new Date(date);
  queryDate.setHours(0, 0, 0, 0);
  const nextDate = new Date(queryDate.getTime() + 24 * 60 * 60 * 1000);

  // 1️⃣ Get all scheduled trips for this provider
  const trips = await tripModel.Trip.find({
    providerId,
    status: "scheduled",
  })
    .populate("providerId", "companyName rating")
    .lean();

  // 2️⃣ For each trip, get availability for this specific date
  const tripsWithAvailability = await Promise.all(
    trips.map(async (trip) => {
      const availability = await dailyAvailabilityModel.DailyAvailability.findOne({
        tripId: trip._id,
        date: { $gte: queryDate, $lt: nextDate },
      }).lean();

      const bookedSeats = availability ? availability.bookedSeats : 0;
      const availableSeats = trip.totalSeats - bookedSeats;

      // Optional: if provider wants to see daily dynamic multiplier as well
      const dynamicMultiplier =
        availability?.dynamicPricing?.multiplier ?? trip.dynamicPricing.multiplier ?? 1;

      return {
        ...trip,
        bookedSeats,
        availableSeats,
        travelDate: queryDate.toISOString().split("T")[0],
        dynamicPricing: {
          multiplier: dynamicMultiplier,
          lastUpdated: availability?.dynamicPricing?.lastUpdated || trip.dynamicPricing.lastUpdated,
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    results: tripsWithAvailability.length,
    data: { trips: tripsWithAvailability },
  });
});


// 🟢 Get all trips for a specific provider
exports.getProviderTrips = catchAsync(async (req, res, next) => {
  const provider = await providerModel.Provider.findById(req.params.id);
  if (!provider) {
    return res.status(403).json({ message: "Provider not found!" });
  }

  const trips = await tripModel.Trip.find({ providerId: provider._id });
  res.status(200).json({
    status: "success",
    results: trips.length,
    data: { trips },
  });
});

// 🟢 Get single trip by ID
exports.getTripById = catchAsync(async (req, res, next) => {
  const trip = await tripModel.Trip.findById(req.params.id).populate("providerId", "companyName rating");

  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  res.status(200).json({
    success: true,
    data: trip,
  });
});

// 🟢 Update trip details (only basic info, not per-day availability)
exports.updateTrip = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const allowedFields = ["source", "destination", "mode", "departureTime", "arrivalTime", "totalSeats", "basePrice"];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updatedTrip = await tripModel.Trip.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedTrip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  res.status(200).json({
    success: true,
    message: "Trip updated successfully",
    data: updatedTrip,
  });
});

// 🟠 Cancel a trip (instead of deleting)
exports.deleteTrip = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const trip = await tripModel.Trip.findById(id);
  if (!trip) {
    return res.status(404).json({ message: "Trip not found" });
  }

  trip.status = "cancelled";
  await trip.save();

  res.status(200).json({
    status: "success",
    message: "Trip cancelled successfully (recurring trips paused)",
  });
});

// 📋 Get all customers who booked a specific trip (for providers)
exports.getTripCustomersByDate = catchAsync(async (req, res, next) => {
  const { tripId, travelDate } = req.params;

  if (!tripId || !travelDate) {
    return res.status(400).json({
      success: false,
      message: "Trip ID and travel date are required",
    });
  }

  // ✅ Convert travelDate (YYYY-MM-DD) to a proper Date range for that day
  const startOfDay = new Date(travelDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(travelDate);
  endOfDay.setHours(23, 59, 59, 999);

  // ✅ Find the trip first
  const trip = await tripModel.Trip.findById(tripId)
    .populate("providerId", "companyName email")
    .lean();

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: "Trip not found",
    });
  }

  // ✅ Find all bookings for this trip on that date
  const bookings = await bookingModel.Booking.find({
    tripId,
    travelDate: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate("customerId", "name email")
    .lean();

  if (!bookings.length) {
    return res.status(200).json({
      success: true,
      message: "No customers have booked this trip on this date",
      data: { trip, customers: [], totalSeatsBooked: 0, totalRevenue: 0 },
    });
  }

  // ✅ Prepare formatted customer data
  const customers = bookings.map((b) => ({
    name: b.customerId?.name || "Unknown",
    email: b.customerId?.email || "N/A",
    passengerDetails: b.passengerDetails || [],
    seatNumbers: b.seatNumbers || [],
    pricePaid: b.pricePaid,
    paymentStatus: b.paymentStatus,
    bookingStatus: b.bookingStatus,
    penaltyApplied: b.penaltyApplied || 0,
    bookingDate: b.createdAt,
  }));

  // ✅ Aggregate total revenue & seats booked
  const totalSeatsBooked = bookings.reduce((sum, b) => sum + b.seatNumbers.length, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricePaid || 0), 0);

  res.status(200).json({
    success: true,
    data: {
      trip,
      customers,
      totalSeatsBooked,
      totalRevenue,
    },
  });
});