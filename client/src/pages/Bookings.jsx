import axios from 'axios';
import React, { useEffect, useState }  from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const Api = process.env.REACT_APP_API_URL;

const Bookings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // bus | train | flight | all
  const user = useSelector(state => state.user || { name: 'Guest' });

  const apiEndpoint = Api + "bookings/my";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const response = await axios.post(apiEndpoint, {userId: user._id});
        console.log('====================================');
        console.log(response.data);
        console.log('====================================');
        setListings(response.data.bookings || []);
        setFilteredListings(response.data.bookings || []);
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [apiEndpoint, user._id]);

  // Filter bookings by mode
  useEffect(() => {
    if (filter === "all") {
      setFilteredListings(listings);
    } else {
      setFilteredListings(listings.filter(l => l.tripId?.mode === filter));
    }
  }, [filter, listings]);

  // Cancel booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await axios.post(`${Api}bookings/cancelbooking`, { bookingId });
      alert(res.data.message || "Booking cancelled");
      // Update UI
      setListings(prev => prev.map(b => b._id === bookingId ? { ...b, bookingStatus: "cancelled" } : b));
    } catch (err) {
      console.error("Error cancelling booking:", err);
      alert("Failed to cancel booking");
    }
  };

  // Reschedule booking
  const handleReschedule = async (bookingId) => {
    const newDateStr = prompt("Enter new travel date (YYYY-MM-DD):");
    if (!newDateStr) return;
    const newDate = new Date(newDateStr);

    try {
      const res = await axios.post(`${Api}bookings/reschedule`, { bookingId, newDate });
      console.log("reschedule data");
      console.log(res.data);
      alert(`Booking rescheduled! Penalty: ₹${res.data.bookings.penaltyApplied}`);
      setListings(prev => prev.map(b => b._id === bookingId ? { ...b, rescheduledDate: newDate, penaltyApplied: res.data.bookings.penaltyApplied } : b));
    } catch (err) {
      console.error("Error rescheduling booking:", err);
      alert("Failed to reschedule booking");
    }
  };

  return (
    <div className="listings-section">
      <h3>MY Bookings</h3>

      {/* Filter dropdown */}
      <div style={{ marginBottom: "15px" }}>
        <label>Filter by mode: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="bus">Bus</option>
          <option value="train">Train</option>
          <option value="flight">Flight</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredListings.length === 0 ? (
        <p>No bookings to display</p>
      ) : (
        filteredListings.map((l) => ( 
          <div key={l._id} className="listing-card">
            <div>
              <strong>{l.tripId?.source} → {l.tripId?.destination}</strong> ({l?.tripId?.mode})<br />
              Provider: {l.tripId?.providerId.companyName} 
              | Depart: {l.tripId?.departureTime}
              | Arrival: {l.tripId?.arrivalTime} <br />
              
              Travel Date: {new Date(l.travelDate).toLocaleDateString()}<br />
              {l.rescheduledDate && (
                <>New Travel Date: {new Date(l.rescheduledDate).toLocaleDateString()}<br /></>
              )}

              Seat Numbers:{" "}
              {l?.seatNumbers?.map((seat, index) => (
                <span key={index}>{seat}{index < l.seatNumbers.length - 1 ? ", " : ""}</span>
              ))} <br />

              {l.penaltyApplied >0 && <span style={{color:"darkred"}}>Total Penality Applied: ₹{l.penaltyApplied}</span>}
              {l.penaltyApplied >0 &&  <br />}
             

              Status:{" "}
              <span
                style={{
                  color: l.bookingStatus === "active" ? "green" : 
                         l.bookingStatus === "cancelled" ? "red" : "orange",
                  fontWeight: "bold"
                }}
              >
                {l.bookingStatus}
              </span> <br />

              Passenger details: 
              {l.passengerDetails.map((p, index) =>(
                <div key={index}>
                  {index+1}. Name: {p.name} ({p.gender}), Age: {p.age}
                </div>
              ))}
            </div>

            <div>
              <span className="price">Price paid: ₹{l.pricePaid}</span>
              {l.bookingStatus === "active" && (
                <>
                  <button onClick={() => handleReschedule(l._id)}>Reschedule</button>
                  <button onClick={() => handleCancel(l._id)}>Cancel</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Bookings;
