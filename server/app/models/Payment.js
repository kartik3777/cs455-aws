const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["credit_card", "upi", "netbanking", "wallet"], required: true },
  transactionId: { type: String, unique: true },
  status: { type: String, enum: ["success", "failed", "pending"], default: "pending" }
}, { timestamps: true });


const Payment = mongoose.model('Payment',paymentSchema)

module.exports = {Payment}
// module.exports = mongoose.model("Payment", paymentSchema);
