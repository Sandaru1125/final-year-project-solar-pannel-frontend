import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus } from '../../api/api';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getBookings();
      setBookings(response.bookings || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update booking status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', text: '⏳ Pending' },
      completed: { class: 'badge-completed', text: '✅ Completed' },
      cancelled: { class: 'badge-cancelled', text: '❌ Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatIssueName = (issue) => {
    const names = {
      clean: 'Clean',
      dusty: 'Dusty',
      snowy: 'Snow Covered',
      bird_drop: 'Bird Droppings',
      electrical_damage: 'Electrical Damage',
      physical_damage: 'Physical Damage'
    };
    return names[issue] || issue.replace(/_/g, ' ');
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1>📋 All Bookings</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {bookings.length === 0 ? (
          <div className="card">
            <p className="no-bookings">No bookings found.</p>
          </div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Panel Issue</th>
                  <th>Preferred Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  return (
                    <tr key={booking._id}>
                      <td>{booking.name}</td>
                      <td>{booking.email}</td>
                      <td>
                        <span className={`issue-badge issue-${booking.panelIssue}`}>
                          {formatIssueName(booking.panelIssue)}
                        </span>
                      </td>
                      <td>{formatDate(booking.preferredDate)}</td>
                      <td>
                        <span className={`badge ${badge.class}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                className="btn btn-success btn-sm"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                className="btn btn-danger btn-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'completed' && (
                            <span className="text-muted">No actions</span>
                          )}
                          {booking.status === 'cancelled' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'pending')}
                              className="btn btn-secondary btn-sm"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
