import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
};

export const slotService = {
  getSlots: (from, to) => api.get(`/slots?from=${from}&to=${to}`),
};

export const bookingService = {
  createBooking: (slotId) => api.post('/book', { slotId }),
  getMyBookings: () => api.get('/my-bookings'),
  getAllBookings: () => api.get('/all-bookings'),
};

export default api;