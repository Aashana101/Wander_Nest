const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const cors = require("cors");

// Import route files
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_XUojmwL5PXwFlb",
  key_secret: "shaM5Z5C472rZR8o10x8UG8D",
});

/* Create Razorpay Order */
app.post("/orders", async (req, res) => {
  const options = {
    amount: req.body.amount, // Amount in smallest currency unit
    currency: req.body.currency || "INR",
    receipt: "receipt#1",
    payment_capture: 1, // Auto-capture payment
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* Fetch Payment Details */
app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment) {
      return res.status(500).json("Error fetching Razorpay payment details");
    }
    res.json({
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json("Failed to fetch payment details");
  }
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "Dream_Nest",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((err) => console.error(`Database connection error: ${err}`));
