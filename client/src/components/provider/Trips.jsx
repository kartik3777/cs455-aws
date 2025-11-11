import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Api = process.env.REACT_APP_API_URL;

const Trips = ({ data = [], selectedDate }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setListings(data);
    } else {
      setListings([]);
    }
  }, [data]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Api}trips/${id}`);
      setListings((prev) => prev.filter((trip) => trip._id !== id));
      alert("Trip deleted successfully");
    } catch (err) {
      console.error("Error deleting trip:", err);
      alert("Error deleting trip");
    }
  };

  return (
    <div className="listings-section">
      <h3>Your Trips</h3>
      {listings.length === 0 ? (
        <p>No trips available.</p>
      ) : (
        listings.map((l) => (
          <div key={l._id} className="listing-card">
            <div>
              <strong>
                {l.source} → {l.destination}
              </strong>{" "}
              ({l.mode})<br />
              Depart: {l.departureTime} | Arrival:{l.arrivalTime}
              <br />
              Seats: {l.availableSeats ?? "-"} / {l.totalSeats}
              <br />
              Price: ₹
              {(l.basePrice * (l.dynamicPricing?.multiplier || 1)).toFixed(2)}
              <br />
              Rating: {l.providerId?.rating ?? "N/A"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button onClick={() => navigate(`/home/edittrip/${l._id}`)}>✏️ Edit</button>
              <button onClick={() => handleDelete(l._id)}>🗑️ Delete</button>
              <button
                onClick={() =>
                  navigate(`/home/trip/${l._id}/customers/${selectedDate}`)
                }
              >
                👥 View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Trips;
