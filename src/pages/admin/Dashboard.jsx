import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBookings } from '../../api/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getBookings();
      const bookings = response.bookings || [];
      
      const newStats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      };
      
      setStats(newStats);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1>📊 Admin Dashboard</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card stat-total">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Total Bookings</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card stat-pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p className="stat-number">{stats.pending}</p>
            </div>
          </div>

          <div className="stat-card stat-completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p className="stat-number">{stats.completed}</p>
            </div>
          </div>

          <div className="stat-card stat-cancelled">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>Cancelled</h3>
              <p className="stat-number">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link to="/admin/bookings" className="btn btn-primary">
            View All Bookings →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



