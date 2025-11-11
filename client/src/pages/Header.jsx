import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user || { name: 'Guest' });

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const toggle = () => setOpen(prev => !prev);

  // navigate to different pages
  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };
  function goHome(){
    navigate("/home");
  }

  return (
    <header className="dashboard-header">
      <h2 onClick={goHome} className="brand">Welcome, {user.name}</h2>
      {/* {
        user.role ==="customer" &&
        <div className="service-options">
        <h3  onClick={() => handleNavigate('/home')}> <span>All</span></h3>
        <h3  onClick={() => handleNavigate('/home/flights')}><FlightIcon /> <span>Flight</span></h3>
        <h3  onClick={() => handleNavigate('/home/trains')}><TrainIcon /> <span>Train</span></h3>
        <h3  onClick={() => handleNavigate('/home/buses')}><DirectionsBusIcon /> <span>Bus</span></h3>
      </div>
      } */}
      

      <div className="user-info" ref={containerRef}>
        <button
          type="button"
          className="profile-btn"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={toggle}
        >
          <AccountCircleIcon fontSize="large" />
          <span className="username">{user.name}</span>
        </button>

        <div className={`dropdown-menu ${open ? 'open' : ''}`} role="menu">
          <button type="button" onClick={() => handleNavigate('/home/edit-profile')}>
            Edit Profile
          </button>
          {user.role === "customer" && 
          <>
           <button type="button" onClick={() => handleNavigate('/home/transactions')}>
            Transaction History
          </button>
          <button type="button" onClick={() => handleNavigate('/home/mybookings')}>
            My Bookings
          </button>
          <button type="button" onClick={() => handleNavigate('/home/upcomings')}>
            Upcoming Journeys
          </button>
          </>
          }
         
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogoutIcon style={{ fontSize: 18, marginRight: 8 }} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
