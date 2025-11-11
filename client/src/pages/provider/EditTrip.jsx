import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./AddTrip.css";

const apiUrl = process.env.REACT_APP_API_URL;

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch trip details
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`${apiUrl}trips/${id}`);
        setTrip(res.data.data);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrip((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Extract only allowed fields to send to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const payload = {
        source: trip.source,
        destination: trip.destination,
        mode: trip.mode,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        totalSeats: Number(trip.totalSeats),
        basePrice: Number(trip.basePrice),
      };

      await axios.put(`${apiUrl}trips/${id}`, payload);
      alert("✅ Trip updated successfully!");
      navigate("/home/provider");
    } catch (err) {
      console.error("Error updating trip:", err);
      alert("❌ Failed to update trip. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!trip) return <p className="error">No trip found.</p>;

  return (
    <div className="add-trip-container">
      <h2>Edit Trip</h2>

      <form onSubmit={handleSubmit} className="add-trip-form">
        <div className="form-group">
          <label>Source:</label>
          <input
            type="text"
            name="source"
            value={trip.source || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Destination:</label>
          <input
            type="text"
            name="destination"
            value={trip.destination || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mode:</label>
          <select
            name="mode"
            value={trip.mode || ""}
            onChange={handleChange}
            required
          >
            <option value="">Select Mode</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="flight">Flight</option>
          </select>
        </div>

        <div className="form-group">
          <label>Departure Time:</label>
          <input
            type="time"
            name="departureTime"
            value={trip.departureTime || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Arrival Time:</label>
          <input
            type="time"
            name="arrivalTime"
            value={trip.arrivalTime || ""}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Seats:</label>
          <input
            type="number"
            name="totalSeats"
            value={trip.totalSeats || ""}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Base Price (₹):</label>
          <input
            type="number"
            name="basePrice"
            value={trip.basePrice || ""}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <button type="submit" disabled={updating}>
          {updating ? "Updating..." : "Update Trip"}
        </button>
      </form>
    </div>
  );
};

export default EditTrip;
