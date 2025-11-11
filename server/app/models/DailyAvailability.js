const mongoose = require("mongoose");

const dailyAvailabilitySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  date: { type: Date, required: true },
  bookedSeats: { type: Number, default: 0 },
  dynamicPricing: {
    multiplier: { type: Number, default: 1 },
    lastUpdated: { type: Date },
  },
});

// module.exports = mongoose.model("DailyAvailability", dailyAvailabilitySchema);


const DailyAvailability = mongoose.model("DailyAvailability", dailyAvailabilitySchema);

module.exports = { DailyAvailability };
