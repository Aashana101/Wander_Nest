import { useEffect, useState } from "react";
import "../styles/List.scss";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import { setTripList } from "../redux/state";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer";

const TripList = () => {
  const [loading, setLoading] = useState(true); // Tracks loading state
  const userId = useSelector((state) => state?.user?._id); // Fetch user ID from Redux store
  const tripList = useSelector((state) => state?.user?.tripList); // Fetch trip list from Redux store

  const dispatch = useDispatch();

  // Fetch the trip list from the backend
  const fetchTripList = async () => {
    try {
      const response = await fetch(`http://localhost:3001/users/${userId}/trips`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trips.");
      }

      const data = await response.json();
      dispatch(setTripList(data)); // Update Redux state with the latest trips
    } catch (err) {
      console.error("Error fetching trip list:", err.message);
    } finally {
      setLoading(false); // Stop the loader regardless of success or failure
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchTripList();
  }, []);

  // Manually refresh the trip list (if required)
  const refreshTrips = async () => {
    setLoading(true); // Show loader during refresh
    await fetchTripList();
  };

  // Render loading state
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="trip-list-container">
        <h1 className="title-list">Your Trip List</h1>
        <div className="list">
          {tripList?.length > 0 ? (
            tripList.map(
              ({ listingId, hostId, startDate, endDate, totalPrice, booking = true }) => (
                <ListingCard
                  key={listingId?._id}
                  listingId={listingId?._id}
                  creator={hostId?._id}
                  listingPhotoPaths={listingId?.listingPhotoPaths}
                  city={listingId?.city}
                  province={listingId?.province}
                  country={listingId?.country}
                  category={listingId?.category}
                  startDate={new Date(startDate).toDateString()}
                  endDate={new Date(endDate).toDateString()}
                  totalPrice={totalPrice}
                  booking={booking}
                />
              )
            )
          ) : (
            <p className="empty-list">You have no trips booked yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TripList;
