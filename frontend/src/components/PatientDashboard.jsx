import React, { useState, useEffect } from 'react';
import { slotService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'mybookings'
  const { user } = useAuth();

  // Get next 7 days date range
  const getDateRange = () => {
    const from = new Date();
    const to = new Date();
    to.setDate(from.getDate() + 7);
    
    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0]
    };
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { from, to } = getDateRange();
      const response = await slotService.getSlots(from, to);
      setAvailableSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await bookingService.getMyBookings();
      setMyBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch your bookings');
    }
  };

  const handleBookSlot = async (slotId) => {
    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      await bookingService.createBooking(slotId);
      setSuccess('Appointment booked successfully!');
      
      // Refresh data
      await fetchAvailableSlots();
      await fetchMyBookings();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchAvailableSlots();
    fetchMyBookings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-2">Book your appointments and manage your schedule</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('book')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'book'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('mybookings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mybookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Bookings ({myBookings.length})
          </button>
        </nav>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Book Appointment Tab */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Available Time Slots</h2>
            <p className="text-sm text-gray-600 mt-1">Next 7 days (9 AM - 5 PM, weekdays only)</p>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No available slots found for the next 7 days.</p>
                <button
                  onClick={fetchAvailableSlots}
                  className="mt-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateTime(slot.startAt)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                    </div>
                    <button
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={bookingLoading}
                      className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                    >
                      {bookingLoading ? 'Booking...' : 'Book This Slot'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Bookings Tab */}
      {activeTab === 'mybookings' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Appointments</h2>
            <p className="text-sm text-gray-600 mt-1">Your booked appointments</p>
          </div>
          
          <div className="p-6">
            {myBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>You haven't booked any appointments yet.</p>
                <button
                  onClick={() => setActiveTab('book')}
                  className="mt-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Book your first appointment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-lg font-medium text-gray-900">
                          {formatDateTime(booking.slot.startAt)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Duration: {formatDateTime(booking.slot.startAt)} - {formatDateTime(booking.slot.endAt)}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Booked on: {formatDateTime(booking.createdAt)}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;