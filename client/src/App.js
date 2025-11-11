import './App.css';
import Login from './components/auth/login';
import SignUp from './components/auth/signup';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import CustomerDashboard from './pages/userDashboard';
import EditProfile from './pages/EditProfile';
import Flight from './pages/Flight';
import Train from './pages/Train';
import Bus from './pages/Bus';
import AddTrip from './pages/provider/AddTrip';
import HomeProvider from './pages/provider/HomeProvider';
import Trips from './components/provider/Trips';
import EditTrip from './pages/provider/EditTrip';
import Bookings from './pages/Bookings';
import Upcoming from './pages/Upcoming';
import TripCustomerDetails from './pages/provider/TripCustomerDetails';

// ✅ NEW: import the floating chatbot component
import Chatbot from './components/Chatbot';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="SignUp" element={<SignUp />} />
          <Route path="Login" element={<Login />} />
          {/* not implemented yet */}
          {/* <Route path="forgotpassword" element={<ForgotPassword />} />
          <Route path={`/resetpassword/:token`} element={<ResetPassword />} /> */}

          <Route path="/home" element={<Home />}>
            {/* Nested routes inside Home */}
            <Route index element={<CustomerDashboard />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="flights" element={<Flight />} />
            <Route path="trains" element={<Train />} />
            <Route path="buses" element={<Bus />} />
            <Route path="mybookings" element={<Bookings />} />
            <Route path="upcomings" element={<Upcoming />} />
            {/* provider routes */}
            <Route path="addtrip" element={<AddTrip />} />
            <Route path="provider" element={<HomeProvider />} />
            <Route path="trips" element={<Trips />} />
            <Route
              path="trip/:tripId/customers/:travelDate"
              element={<TripCustomerDetails />}
            />
            <Route path="edittrip/:id" element={<EditTrip />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* ✅ Floating chatbot appears on every page */}
      <Chatbot />
    </>
  );
}

export default App;
