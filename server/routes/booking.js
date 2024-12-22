const router = require("express").Router();

const Booking = require("../models/Booking");
const User = require("../models/User");

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice } =
      req.body;

    // Create a new booking and save it to the database
    const newBooking = new Booking({
      customerId,
      hostId,
      listingId,
      startDate,
      endDate,
      totalPrice,
    });
    await newBooking.save();

    // Update the user's trip list
    const user = await User.findById(customerId);
    if (user) {
      user.trips.push(newBooking._id); // Add the booking ID to the user's trips array
      await user.save(); // Save the updated user document
    }

    res
      .status(200)
      .json({ message: "Booking created successfully!", booking: newBooking });
  } catch (err) {
    console.error("Error creating booking:", err.message);
    res
      .status(400)
      .json({ message: "Fail to create a new Booking!", error: err.message });
  }
});

module.exports = router;
