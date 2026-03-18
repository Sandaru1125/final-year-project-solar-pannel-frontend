import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../api/api';
import './Booking.css';

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    panelIssue: 'dusty',
    preferredDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get prediction result from sessionStorage
    const storedResult = sessionStorage.getItem('predictionResult');
    if (storedResult) {
      const result = JSON.parse(storedResult);
      setFormData(prev => ({
        ...prev,
        panelIssue: result.prediction || 'dusty'
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.email || !formData.preferredDate) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const storedResult = sessionStorage.getItem('predictionResult');
      let imageUrl = '';
      let prediction = formData.panelIssue;

      if (storedResult) {
        const result = JSON.parse(storedResult);
        imageUrl = result.imageUrl || '';
        prediction = result.prediction || formData.panelIssue;
      }

      await createBooking({
        ...formData,
        imageUrl,
        prediction
      });

      setSuccess(true);
      
      // Clear form after 3 seconds and redirect
      setTimeout(() => {
        sessionStorage.removeItem('predictionResult');
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <div className="card">
          <h1>📅 Book Cleaning Service</h1>
          <p className="subtitle">Fill in the details to schedule a cleaning service for your solar panels</p>

          {success && (
            <div className="alert alert-success">
              ✅ Booking created successfully! Redirecting to home...
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="panelIssue">Panel Condition *</label>
              <select
                id="panelIssue"
                name="panelIssue"
                value={formData.panelIssue}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="clean">Clean</option>
                <option value="dusty">Dusty</option>
                <option value="snowy">Snow Covered</option>
                <option value="bird_drop">Bird Droppings</option>
                <option value="electrical_damage">Electrical Damage</option>
                <option value="physical_damage">Physical Damage</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredDate">Preferred Date *</label>
              <input
                type="date"
                id="preferredDate"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span> Submitting...
                </>
              ) : (
                'Submit Booking'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;


