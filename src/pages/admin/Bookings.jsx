import React, { useState, useEffect } from "react";
import { getBookings, updateBookingStatus } from "../../api/api";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getBookings();
      setBookings(res.bookings || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    await updateBookingStatus(id, status);
    fetchBookings();
  };

  const badgeStyle = (status) => {
    if (status === "completed") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const filteredBookings = bookings
    .filter((b) => (filter === "all" ? true : b.status === filter))
    .filter((b) =>
      `${b.name} ${b.email} ${b.city}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : new Date(b.preferredDate) - new Date(a.preferredDate)
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">📋 Booking Management</h1>
            <p className="text-gray-500">Manage all service bookings</p>
          </div>
          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Search bookings..."
            className="border rounded-lg px-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            className="border rounded-lg px-4 py-2"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">📅 Newest</option>
            <option value="name">👤 Name A-Z</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Service</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{b.name}</td>
                  <td className="p-4">
                    <div>{b.panelIssue.replace("_", " ")}</div>
                    <div className="text-sm text-gray-500">{b.city}</div>
                  </td>
                  <td className="p-4">
                    <div>{b.email}</div>
                    <div className="text-sm">{b.telephone}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${badgeStyle(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(b._id, "completed")}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          ✅ Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(b._id, "cancelled")}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3 py-1 bg-gray-200 rounded"
                    >
                      👁 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              📭 No bookings found
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Booking Details</h2>
                <button onClick={() => setSelectedBooking(null)}>✕</button>
              </div>

              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedBooking.name}</p>
                <p><strong>Email:</strong> {selectedBooking.email}</p>
                <p><strong>Phone:</strong> {selectedBooking.telephone}</p>
                <p><strong>City:</strong> {selectedBooking.city}</p>
                <p><strong>Status:</strong> {selectedBooking.status}</p>
                <p className="text-sm text-gray-500">
                  ID: {selectedBooking._id}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Bookings;
