import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "../api/api";

const Booking = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    panelIssue: "dusty",
    preferredDate: "",
    address: "",
    city: "",
    telephone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load prediction result
  useEffect(() => {
    const storedResult = sessionStorage.getItem("predictionResult");
    if (storedResult) {
      const result = JSON.parse(storedResult);
      setFormData((prev) => ({
        ...prev,
        panelIssue: result.prediction || "dusty",
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !formData.name ||
      !formData.email ||
      !formData.preferredDate ||
      !formData.address ||
      !formData.city ||
      !formData.telephone
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const storedResult = sessionStorage.getItem("predictionResult");
      let imageUrl = "";
      let prediction = formData.panelIssue;

      if (storedResult) {
        const result = JSON.parse(storedResult);
        imageUrl = result.imageUrl || "";
        prediction = result.prediction || formData.panelIssue;
      }

      const payload = { ...formData, imageUrl, prediction };

      await createBooking(payload);

      setSuccess(true);

      setTimeout(() => {
        sessionStorage.removeItem("predictionResult");
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to create booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          📅 Book Cleaning Service
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Fill in the details to schedule a cleaning service for your solar panels
        </p>

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-100 text-green-700">
            ✅ Booking created successfully! Redirecting to home...
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Panel Condition */}
          <div>
            <label className="block font-medium mb-1">Panel Condition *</label>
            <select
              name="panelIssue"
              value={formData.panelIssue}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            >
              <option value="clean">Clean</option>
              <option value="dusty">Dusty</option>
              <option value="snowy">Snow Covered</option>
              <option value="bird_drop">Bird Droppings</option>
              <option value="electrical_damage">Electrical Damage</option>
              <option value="physical_damage">Physical Damage</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block font-medium mb-1">Preferred Date *</label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-medium mb-1">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* City */}
          <div>
            <label className="block font-medium mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Telephone */}
          <div>
            <label className="block font-medium mb-1">Telephone *</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
