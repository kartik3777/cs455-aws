import React, { useEffect, useState } from 'react';
import Search from '../components/search/Search';
import axios from 'axios';
import Listings from '../components/tripList/Listings';

const apiUrl = process.env.REACT_APP_API_URL;

const Bus = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiEndpoint = `${apiUrl}trips/buses`;

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiEndpoint);
        setBuses(response.data.data.trips); 
      } catch (err) {
        console.error(err);
        setError("Failed to load buses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [apiEndpoint]);

  return (
    <div>
      <Search />
      {loading && <p>Loading buses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <Listings data={buses} />}
    </div>
  );
};

export default Bus;
