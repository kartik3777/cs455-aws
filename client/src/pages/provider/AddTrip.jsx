import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./AddTrip.css";

const apiUrl = process.env.REACT_APP_API_URL;

const AddTrip = () => {
  const provider = useSelector((state) => state.user); // provider info
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mode: "bus",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    totalSeats: "",
    basePrice: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      mode: "bus",
      source: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      totalSeats: "",
      basePrice: "",
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (
      !formData.source ||
      !formData.destination ||
      !formData.departureTime ||
      !formData.arrivalTime ||
      !formData.totalSeats ||
      !formData.basePrice
    ) {
      setError("⚠️ Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${apiUrl}trips/add`, {
        ...formData,
        providerId: provider._id,
      });

      setSuccess("✅ Trip added successfully!");
      console.log(res.data);
      setTimeout(() => navigate("/home/provider"), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "❌ Failed to add trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-trip-container">
      <h2>Add New Daily Trip</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="add-trip-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Mode</label>
          <select name="mode" value={formData.mode} onChange={handleChange}>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="flight">Flight</option>
          </select>
        </div>

        <div className="form-group">
          <label>Source</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="e.g. Kanpur"
            required
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="e.g. Delhi"
            required
          />
        </div>

        <div className="form-group">
          <label>Departure Time (Daily)</label>
          <input
            type="time"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Arrival Time (Daily)</label>
          <input
            type="time"
            name="arrivalTime"
            value={formData.arrivalTime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Total Seats</label>
          <input
            type="number"
            name="totalSeats"
            value={formData.totalSeats}
            onChange={handleChange}
            required
            min={1}
            placeholder="e.g. 40"
          />
        </div>

        <div className="form-group">
          <label>Base Price (₹)</label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            required
            min={0}
            placeholder="e.g. 500"
          />
        </div>

        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Trip"}
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTrip;
