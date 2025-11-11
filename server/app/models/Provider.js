const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true },
  servicesOffered: [{ type: String, enum: ["bus", "train", "flight"] }],
  rating: { type: Number, min: 0, max: 5, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });


const Provider = mongoose.model("Provider", providerSchema);

module.exports = {Provider}