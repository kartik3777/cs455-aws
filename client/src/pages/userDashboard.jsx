import React, { useEffect, useState, useMemo } from "react";
import "./userDashboard.css";
import Header from "./Header";
import Listings from "../components/tripList/Listings";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;

export default function CustomerDashboard() {
  const [user] = useState({ _id: "u1", name: "Kartik Kumar", email: "kartik@example.com" });
  const [trips, setTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Filter, Sort, Search states ===
  const [selectedMode, setSelectedMode] = useState("all");
  const [sortOption, setSortOption] = useState("");
  const [searchSource, setSearchSource] = useState("");
  const [searchDestination, setSearchDestination] = useState("");

  // Generate next 7 days for date buttons
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  // Fetch trips for selected date
  const fetchTripsByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiUrl}trips/date/${date}`);
      setTrips(response.data.data.trips || []);
      console.log("Fetched trips for date:", date, response.data.data.trips);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError("Failed to load trips. Please try again.");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsByDate(selectedDate);
  }, [selectedDate]);

  // === Filtering, searching, and sorting logic ===
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = [...trips];

    // 1️⃣ Apply search filters first (case-insensitive substring match)
    if (searchSource.trim() !== "") {
      filtered = filtered.filter((trip) =>
        trip.source?.toLowerCase().includes(searchSource.toLowerCase())
      );
    }

    if (searchDestination.trim() !== "") {
      filtered = filtered.filter((trip) =>
        trip.destination?.toLowerCase().includes(searchDestination.toLowerCase())
      );
    }

    // 2️⃣ Apply mode filter
    if (selectedMode !== "all") {
      filtered = filtered.filter((trip) => trip.mode === selectedMode);
    }

    // 3️⃣ Sorting logic (with dynamic pricing)
    const getEffectivePrice = (trip) =>
      trip.basePrice * (trip.dynamicPricing?.multiplier || 1);

    if (sortOption === "price-asc") {
      filtered.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sortOption === "price-desc") {
      filtered.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else if (sortOption === "time-asc") {
      filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else if (sortOption === "time-desc") {
      filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    } else if (sortOption === "seats-desc") {
      filtered.sort((a, b) => b.availableSeats - a.availableSeats);
    } else if (sortOption === "seats-asc") {
      filtered.sort((a, b) => a.availableSeats - b.availableSeats);
    }

    return filtered;
  }, [trips, selectedMode, sortOption, searchSource, searchDestination]);

  return (
    <div className="dashboard-container">
      {/* <Header user={user} /> */}

      {/* === DATE SELECTOR === */}
      <div className="date-selector">
        {next7Days.map((date) => (
          <button
            key={date}
            className={`date-btn ${selectedDate === date ? "active" : ""}`}
            onClick={() => setSelectedDate(date)}
          >
            {new Date(date).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </button>
        ))}
      </div>

      {/* === SEARCH BAR === */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Source..."
          value={searchSource}
          onChange={(e) => setSearchSource(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination..."
          value={searchDestination}
          onChange={(e) => setSearchDestination(e.target.value)}
        />
      </div>

      {/* === FILTERS & SORT === */}
      <div className="filters-container">
        <div className="filter-group">
          <label>Mode:</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
          >
            <option value="all">All</option>
            <option value="bus">Bus</option>
            <option value="train">Train</option>
            <option value="flight">Flight</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="">None</option>
            <option value="price-asc">Price (Low → High)</option>
            <option value="price-desc">Price (High → Low)</option>
            <option value="time-asc">Departure (Earliest → Latest)</option>
            <option value="time-desc">Departure (Latest → Earliest)</option>
            <option value="seats-desc">Seats (Most → Least)</option>
            <option value="seats-asc">Seats (Least → Most)</option>
          </select>
        </div>
      </div>

      {/* === TRIPS === */}
      {loading && <p>Loading trips...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && filteredAndSortedTrips.length > 0 && (
        <Listings data={filteredAndSortedTrips} selectedDate={selectedDate} />
      )}
      {!loading && !error && filteredAndSortedTrips.length === 0 && (
        <p>No trips available for {selectedDate}</p>
      )}
    </div>
  );
}
