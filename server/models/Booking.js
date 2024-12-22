const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
    },
    startDate: {
      type: Date, // Changed to Date type for better consistency
      required: true,
    },
    endDate: {
      type: Date, // Changed to Date type for better consistency
      required: true,
    },
    totalPrice: {
      type: Number, // Explicitly ensures this is a number
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
