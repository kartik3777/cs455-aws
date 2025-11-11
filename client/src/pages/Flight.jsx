import React, { useEffect, useState } from 'react';
import Search from '../components/search/Search';
import axios from 'axios';
import Listings from '../components/tripList/Listings';

const apiUrl = process.env.REACT_APP_API_URL;

const Flight = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiEndpoint = `${apiUrl}trips/flights`;

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiEndpoint);
        setFlights(response.data.data.trips); // assuming response.data is the array of flights
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError("Failed to load flights. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [apiEndpoint]);

  return (
    <div>
      <Search />
      {loading && <p>Loading flights...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <Listings data={flights} />}
    </div>
  );
};

export default Flight;

