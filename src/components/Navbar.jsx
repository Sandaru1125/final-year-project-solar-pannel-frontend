import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🌞 SolarCare
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/admin/bookings" className="nav-link">Bookings</Link>
              <button onClick={handleLogout} className="nav-link btn-logout">
                Logout
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="nav-link">Admin Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;




