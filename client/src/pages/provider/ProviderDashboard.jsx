import React, { useState, useEffect } from 'react';
import Trips from '../../components/provider/Trips';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const apiUrl = process.env.REACT_APP_API_URL;

const ProviderDashboard = () => {
  const user = useSelector(state => state.user || { name: 'Guest' });
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [modeFilter, setModeFilter] = useState('all');
  const [sortOption, setSortOption] = useState('departureTime');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For 7-day date navigation
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // 📅 Generate next 7 days
  useEffect(() => {
    const today = new Date();
    const next7 = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      next7.push(d);
    }
    setDates(next7);
    setSelectedDate(today.toISOString().split("T")[0]);
  }, []);

  // 🧭 Fetch trips for the selected date for this provider
  useEffect(() => {
    if (!selectedDate || !user._id) return;

    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiUrl}trips/provider/${user._id}/by-date/${selectedDate}`);
        const trips = res.data?.data?.trips || [];
        console.log('trips of date='+ selectedDate);
        console.log(trips);
        console.log('====================================');
        setListings(trips);
        setFilteredListings(trips);
        setError(null);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Failed to load trips. Please try again.");
        setListings([]);
        setFilteredListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [selectedDate, user._id]);

  // 🔍 Filter & sort logic
  useEffect(() => {
    let updated = [...listings];
    if (modeFilter !== 'all') {
      updated = updated.filter(trip => trip.mode === modeFilter);
    }

    if (sortOption === 'departureTime') {
      updated.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    } else if (sortOption === 'price') {
      updated.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOption === 'seats') {
      updated.sort((a, b) => (b.availableSeats || 0) - (a.availableSeats || 0));
    }

    setFilteredListings(updated);
  }, [modeFilter, sortOption, listings]);

  return (
    <div className="provider-dashboard" style={{ padding: '1rem' }}>
      <div
        className="dashboard-actions"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1rem'
        }}
      >
        <button onClick={() => navigate("/home/addtrip")}>➕ Add Trip</button>

        {/* Filter by mode */}
        <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}>
          <option value="all">All Modes</option>
          <option value="flight">Flights</option>
          <option value="train">Trains</option>
          <option value="bus">Buses</option>
        </select>

        {/* Sorting options */}
        <select value={sortOption} onChange={e => setSortOption(e.target.value)}>
          <option value="departureTime">Sort by Departure Time</option>
          <option value="price">Sort by Price</option>
          <option value="seats">Sort by Available Seats</option>
        </select>
      </div>

      {/* 📅 Date buttons for next 7 days */}
      <div
        className="date-buttons"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '1rem'
        }}
      >
        {dates.map((d) => {
          const dateStr = d.toISOString().split("T")[0];
          const label = d.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '6px',
                border: selectedDate === dateStr ? '2px solid #007bff' : '1px solid #ccc',
                backgroundColor: selectedDate === dateStr ? '#007bff' : '#f8f9fa',
                color: selectedDate === dateStr ? 'white' : 'black',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading && <p>Loading trips for {selectedDate}...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && filteredListings.length > 0 && (
        <Trips data={filteredListings} selectedDate={selectedDate}/>
      )}
      {!loading && !error && filteredListings.length === 0 && (
        <p>No trips scheduled for {new Date(selectedDate).toLocaleDateString("en-IN")}.</p>
      )}
    </div>
  );
};

export default ProviderDashboard;
