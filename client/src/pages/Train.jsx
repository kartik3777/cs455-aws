import React, { useEffect, useState } from 'react';
import Search from '../components/search/Search';
import axios from 'axios';
import Listings from '../components/tripList/Listings';

const apiUrl = process.env.REACT_APP_API_URL;

const Train = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiEndpoint = `${apiUrl}trips/trains`;

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiEndpoint);
        setTrains(response.data.data.trips); 
      } catch (err) {
        console.error(err);
        setError("Failed to load trains. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
  }, [apiEndpoint]);

  return (
    <div>
      <Search />
      {loading && <p>Loading trains...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && <Listings data={trains} />}
    </div>
  );
};

export default Train;
