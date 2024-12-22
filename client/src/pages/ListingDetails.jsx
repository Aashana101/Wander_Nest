import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const customerId = useSelector((state) => state?.user?._id);
  const navigate = useNavigate();

  // Fetch listing details
  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/properties/${listingId}`,
        { method: "GET" }
      );
      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Listing Details Failed", err.message);
    }
  };

  useEffect(() => {
    getListingDetails();
  }, []);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.round((end - start) / (1000 * 60 * 60 * 24)); // Calculate days

  const handleSubmit = async () => {
    try {
      if (!window.Razorpay) {
        console.error("Razorpay SDK not loaded. Please check your setup.");
        return;
      }

      // Step 1: Create Order
      const { data: order } = await axios.post("http://localhost:3001/orders", {
        amount: listing.price * dayCount * 100, // Amount in paise
        currency: "INR",
      });

      // Step 2: Initialize Razorpay
      const razorpay = new window.Razorpay({
        key: "rzp_test_XUojmwL5PXwFlb", // Replace with your Razorpay API Key
        amount: order.amount,
        currency: order.currency,
        name: "Dream Nest",
        description: "Booking Payment",
        order_id: order.order_id,
        handler: async (response) => {
          try {
            // Step 3: Fetch Payment Details
            const paymentDetails = await axios.get(
              `http://localhost:3001/payment/${response.razorpay_payment_id}`
            );

            if (paymentDetails.data.status === "captured") {
              // Step 4: Proceed with Booking
              const bookingForm = {
                customerId,
                listingId,
                hostId: listing.creator._id,
                startDate: dateRange[0].startDate.toDateString(),
                endDate: dateRange[0].endDate.toDateString(),
                totalPrice: listing.price * dayCount,
              };

              const bookingResponse = await axios.post(
                "http://localhost:3001/bookings/create",
                bookingForm
              );

              if (bookingResponse.status === 200) {
                console.log("Booking successful:", bookingResponse.data);

                // Step 5: Fetch Updated Trips List
                const tripsResponse = await axios.get(
                  `http://localhost:3001/trips/${customerId}`
                );

                if (tripsResponse.status === 200) {
                  navigate(`/${customerId}/trips`, {
                    state: {
                      message: "Booking confirmed!",
                      trips: tripsResponse.data,
                      transactionId: paymentDetails.data.id,
                      amount: bookingForm.totalPrice,
                    },
                  });
                }
              }
            } else {
              console.error("Payment not captured.");
            }
          } catch (err) {
            console.error("Payment verification failed.", err.message);
          }
        },
        prefill: {
          name: "John Doe",
          email: "john.doe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      });

      // Step 6: Open Razorpay Checkout
      razorpay.open();
    } catch (error) {
      console.error("Submit Booking Failed.", error.message);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />
      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item) => (
            <img
              src={`http://localhost:3001/${item.replace("public", "")}`}
              alt="listing photo"
              key={item}
            />
          ))}
        </div>

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <img
            src={`http://localhost:3001/${listing.creator.profileImagePath.replace(
              "public",
              ""
            )}`}
            alt="host profile"
          />
          <h3>
            Hosted by {listing.creator.firstName} {listing.creator.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <div className="booking">
          <h2>How long do you want to stay?</h2>
          <div className="calendar-container">
            <DateRange ranges={dateRange} onChange={handleSelect} />
          </div>

          <div className="pricing">
            <h2>
              ${listing.price} x {dayCount} {dayCount > 1 ? "nights" : "night"}
            </h2>
            <h2>Total price: ${listing.price * dayCount}</h2>
            <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
            <p>End Date: {dateRange[0].endDate.toDateString()}</p>
          </div>

          <button className="booking-button" type="submit" onClick={handleSubmit}>
            BOOKING
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ListingDetails;
