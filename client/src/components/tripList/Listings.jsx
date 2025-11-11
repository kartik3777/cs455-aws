import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Listings.css";

const Api = process.env.REACT_APP_API_URL;

const Listings = ({ data, selectedDate  }) => {
  const [stage, setStage] = useState("list");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [numSeats, setNumSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [passengerDetails, setPassengerDetails] = useState([]);

  const user = useSelector((state) => state.user || { _id: "guest123", name: "Guest" });

  const handleBook = (trip) => {
    setSelectedTrip(trip);
    setStage("booking");
  };

  const handleProceedToPassengers = () => {
    if (numSeats < 1 || numSeats > selectedTrip.availableSeats) {
      alert("Invalid seat count");
      return;
    }
    setPassengerDetails(Array.from({ length: numSeats }, () => ({ name: "", age: "", gender: "" })));
    setStage("passengers");
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index][field] = value;
    setPassengerDetails(updated);
  };

  const handleProceedToPayment = () => {
    for (let i = 0; i < passengerDetails.length; i++) {
      const p = passengerDetails[i];
      if (!p.name || !p.age || !p.gender) {
        alert(`Please fill all details for passenger ${i + 1}`);
        return;
      }
    }
    setStage("payment");
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    try {
      await axios.post(`${Api}bookings/create`, {
        tripId: selectedTrip._id,
        customerId: user._id,
        passengerDetails,
        seatsBooked: numSeats,
        travelDate: selectedDate,
        method: paymentMethod,
      });
      setStage("success");
    } catch (err) {
      console.error("Error creating booking:", err);
      alert("Booking failed, please try again.");
    }
  };

  const resetFlow = () => {
    setSelectedTrip(null);
    setNumSeats(1);
    setPaymentMethod("");
    setPassengerDetails([]);
    setStage("list");
  };

  return (
    <div className="listings-container">
      {stage === "list" &&
        data.map((trip) => (
          <div key={trip._id} className="trip-card">
            <div>
              <strong>
                {trip.source} → {trip.destination}
              </strong>{" "}
              ({trip.mode})<br />
              Provider: {trip.providerId.companyName} <br />
              Departure: {trip.departureTime} | Arrival: {trip.arrivalTime} <br />
              Seats: {trip.availableSeats}/{trip.totalSeats} | Price: ₹{Math.ceil(trip.basePrice * trip.dynamicPricing.multiplier)}
            </div>
            <div>
              <button onClick={() => handleBook(trip)}>Book</button>
            </div>
          </div>
        ))}

      {stage === "booking" && selectedTrip && (
        <div className="booking-card">
          <h4>
            Booking for {selectedTrip.source} → {selectedTrip.destination} on{" "}
            {selectedTrip.travelDate}
          </h4>
          <p>Price per seat: ₹{selectedTrip.basePrice}</p>
          <p>Available seats: {selectedTrip.availableSeats}</p>
          <label>Seats:</label>
          <input
            type="number"
            value={numSeats}
            min={1}
            max={selectedTrip.availableSeats}
            onChange={(e) => setNumSeats(Number(e.target.value))}
          />
          <p>Total: ₹{selectedTrip.basePrice * numSeats}</p>
          <button onClick={handleProceedToPassengers}>Next</button>
          <button onClick={resetFlow}>Cancel</button>
        </div>
      )}

      {stage === "passengers" && (
        <div className="passenger-card">
          <h4>Enter Passenger Details</h4>
          {passengerDetails.map((p, i) => (
            <div key={i} className="passenger-row">
              <input
                type="text"
                placeholder="Name"
                value={p.name}
                onChange={(e) => handlePassengerChange(i, "name", e.target.value)}
              />
              <input
                type="number"
                placeholder="Age"
                value={p.age}
                onChange={(e) => handlePassengerChange(i, "age", e.target.value)}
              />
              <select
                value={p.gender}
                onChange={(e) => handlePassengerChange(i, "gender", e.target.value)}
              >
                <option value="">Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          ))}
          <button onClick={handleProceedToPayment}>Proceed to Payment</button>
          <button onClick={resetFlow}>Cancel</button>
        </div>
      )}

      {stage === "payment" && (
        <div className="payment-card">
          <h4>Choose Payment Method</h4>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Select</option>
            <option value="upi">UPI</option>
            <option value="credit_card">Credit Card</option>
            <option value="wallet">Wallet</option>
            <option value="netbanking">Net Banking</option>
          </select>
          <button onClick={handlePayment}>
            Pay ₹{selectedTrip.basePrice * numSeats}
          </button>
          <button onClick={resetFlow}>Cancel</button>
        </div>
      )}

      {stage === "success" && (
        <div className="success-card">
          <h3>🎉 Booking Successful!</h3>
          <p>
            You booked {numSeats} seat(s) for {selectedTrip.source} → {selectedTrip.destination} on{" "}
            {selectedTrip.travelDate}.
          </p>
          <p>Total Paid: ₹{selectedTrip.basePrice * numSeats}</p>
          <button onClick={resetFlow}>Back to Trips</button>
        </div>
      )}
    </div>
  );
};

export default Listings;
