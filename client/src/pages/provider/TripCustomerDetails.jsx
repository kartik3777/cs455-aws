import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = process.env.REACT_APP_API_URL;

const TripCustomerDetails = () => {
  const { tripId, travelDate } = useParams();
  const navigate = useNavigate();

  const [tripData, setTripData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${apiUrl}trips/provider/${tripId}/customers/${travelDate}`
        );
        console.log('====c===============================');
        console.log(res.data);
        console.log('====================================');
        if (res.data.success) {

          setTripData(res.data.data.trip);
          setCustomers(res.data.data.customers);
        } else {
          setError("Failed to load customer details");
        }
      } catch (err) {
        console.error("Error fetching trip customers:", err);
        setError("Error fetching customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [tripId, travelDate]);

  if (loading) return <p>Loading trip details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

 const totalSeats = customers.reduce(
  (sum, c) =>
    c.bookingStatus === "active"
      ? sum + (c.seatNumbers?.length || 0)
      : sum,
  0
);

  const totalRevenue = customers.reduce(
    (sum, c) => sum + (c.pricePaid || 0),
    0
  );

  return (
    <div style={{ padding: "1rem" }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>
        Trip Details: {tripData?.source} → {tripData?.destination} (
        {tripData?.mode})
      </h2>
      <p>
        Date: <strong>{travelDate}</strong>
      </p>
      <p>
        Total Seats Booked: <strong>{totalSeats}</strong>
      </p>
      <p>
        Total Revenue: <strong>₹{totalRevenue.toFixed(2)}</strong>
      </p>

      <h3>Customer List</h3>
      {customers.length === 0 ? (
        <p>No customers have booked this trip for the selected date.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Passengers</th>
              <th>Seat number</th>
              <th>Price Paid</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr key={idx}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>
                  {c.passengerDetails
                    ?.map((p) => `${p.name} (${p.age}/${p.gender})`)
                    .join(", ")}
                </td>
                <td>{c.seatNumbers.join(", ")}</td>
                <td>₹{c.pricePaid}</td>
                <td>{c.bookingStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TripCustomerDetails;
