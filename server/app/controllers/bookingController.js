const bookingModel = require("../models/Booking");
const paymentModel = require("../models/Payment");
const tripModel = require("../models/Trip");
const catchAsync = require("../utils/catchAsync");
const dailyAvailabilityModel = require("../models/DailyAvailability");
const mongoose = require("mongoose");


exports.createBooking = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tripId, customerId, passengerDetails, seatsBooked, travelDate, method } = req.body;

    if (!tripId || !customerId || !seatsBooked || !travelDate || !passengerDetails.length) {
      throw new Error("Missing required fields");
    }

    // Normalize travel date (midnight)
    const travelDateOnly = new Date(travelDate);
    travelDateOnly.setHours(0, 0, 0, 0);

    // 1️⃣ Fetch Trip
    const trip = await tripModel.Trip.findById(tripId).session(session);
    if (!trip) throw new Error("Trip not found");

    // 2️⃣ Fetch or create DailyAvailability for this date
    let daily = await dailyAvailabilityModel.DailyAvailability.findOne({ tripId, date: travelDateOnly }).session(session);

    if (!daily) {
      daily = await dailyAvailabilityModel.DailyAvailability.create(
        [{ tripId, date: travelDateOnly, bookedSeats: 0, dynamicPricing: { multiplier: 1 } }],
        { session }
      );
      daily = daily[0];
    }

    // 3️⃣ Check seat availability
    const availableSeats = trip.totalSeats - daily.bookedSeats;
    if (availableSeats < seatsBooked) throw new Error("Not enough seats available for this date");

    // 4️⃣ Calculate day-wise dynamic pricing
    const occupancyRate = daily.bookedSeats / trip.totalSeats;
    let multiplier = 1 + occupancyRate * 0.8;

    const hoursToDeparture = (new Date(travelDate) - new Date()) / (1000 * 60 * 60);
    if (hoursToDeparture < 24) multiplier += 0.7;
    else if (hoursToDeparture < 48) multiplier += 0.4;

    daily.dynamicPricing.multiplier = multiplier;
    daily.dynamicPricing.lastUpdated = new Date();
    await daily.save({ session });

    const dynamicPrice = Math.ceil(trip.basePrice * multiplier);

    // 5️⃣ Generate seat numbers
    const seatNumbers = Array.from({ length: seatsBooked }, (_, i) => daily.bookedSeats + i + 1);

    // 6️⃣ Create Booking
    const [booking] = await bookingModel.Booking.create(
      [{
        tripId,
        customerId,
        passengerDetails,
        seatNumbers,
        travelDate: travelDateOnly,
        pricePaid: dynamicPrice * seatsBooked,
        paymentStatus: "paid",
        bookingStatus: "active",
      }],
      { session }
    );

    // 7️⃣ Update DailyAvailability bookedSeats
    daily.bookedSeats += seatsBooked;
    await daily.save({ session });

    // 8️⃣ Create Payment record
    const [payment] = await paymentModel.Payment.create(
      [{
        bookingId: booking._id,
        amount: dynamicPrice * seatsBooked,
        method,
        transactionId: `TXN-${Date.now()}`,
        status: "success",
      }],
      { session }
    );

    // 9️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: "success",
      message: "Booking successful",
      booking,
      payment,
      availableSeats: trip.totalSeats - daily.bookedSeats,
      dynamicPricePerSeat: dynamicPrice
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ status: "fail", message: err.message });
  }
});

/**
 * ✅ Get all bookings for a user
 */
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ status: "fail", message: "userId is required" });

  const bookings = await bookingModel.Booking.find({ customerId: userId })
    .populate({
      path: "tripId",
      populate: { path: "providerId" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({ status: "success", results: bookings.length, bookings });
});

/**
 * ✅ Get upcoming bookings
 */
exports.getUpcomingBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ status: "fail", message: "userId is required" });

  const now = new Date();
  const bookings = await bookingModel.Booking.find({ customerId: userId })
    .populate({
      path: "tripId",
      populate: { path: "providerId" },
    });

  const upcomingBookings = bookings
    .filter(
      (b) =>
        b.bookingStatus !== "cancelled" &&
        new Date(b.travelDate).setHours(0, 0, 0, 0) >= now.setHours(0, 0, 0, 0)
    )
    .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate));

  res.status(200).json({
    status: "success",
    results: upcomingBookings.length,
    bookings: upcomingBookings,
  });
});

/**
 * ✅ Reschedule Booking (change travel date)
 */
exports.rescheduleBooking = catchAsync(async (req, res, next) => {
  const { bookingId, newDate } = req.body;

  const booking = await bookingModel.Booking.findById(bookingId).populate("tripId");
  if (!booking) return res.status(404).json({ status: "fail", message: "Booking not found" });

  const now = new Date();
  const requestedDate = new Date(newDate);
  if (requestedDate < now)
    return res.status(400).json({ status: "fail", message: "Cannot reschedule to past date" });

  // Penalty logic
  const hoursBeforeDeparture = (new Date(booking.travelDate) - now) / (1000 * 60 * 60);
  let penalty = 0;
  if (hoursBeforeDeparture < 24) penalty = booking.pricePaid * 0.2;
  else if (hoursBeforeDeparture < 48) penalty = booking.pricePaid * 0.1;

  booking.penaltyApplied += penalty;
  booking.travelDate = requestedDate;
  booking.bookingStatus = "active";
  await booking.save();

  res.status(200).json({
    status: "success",
    message: "Booking rescheduled successfully",
    bookings: booking,
    penaltyAppliedThisTime: penalty,
    totalPenalty: booking.penaltyApplied,
  });
});

/**
 * ✅ Cancel Booking
 */
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ status: "fail", message: "Booking ID is required" });

  const booking = await bookingModel.Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ status: "fail", message: "Booking not found" });

  if (booking.bookingStatus === "cancelled")
    return res.status(400).json({ status: "fail", message: "Already cancelled" });

  booking.bookingStatus = "cancelled";
  await booking.save();

  res.status(200).json({
    status: "success",
    message: "Booking cancelled successfully",
    booking,
  });
});
