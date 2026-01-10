import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBookings } from "../../api/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getBookings();
      const bookings = response.bookings || [];

      setStats({
        total: bookings.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📊 Admin Dashboard
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="text-4xl">📋</div>
            <div>
              <p className="text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.total}
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="text-4xl">⏳</div>
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-yellow-500">
                {stats.pending}
              </p>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <p className="text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completed}
              </p>
            </div>
          </div>

          {/* Cancelled */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
            <div className="text-4xl">❌</div>
            <div>
              <p className="text-gray-500">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.cancelled}
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="mt-8">
          <Link
            to="/admin/bookings"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            View All Bookings →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
