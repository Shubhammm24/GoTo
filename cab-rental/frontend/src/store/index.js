import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isLoading: false,
  error: null,

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ token, user, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export const useBookingStore = create((set) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/bookings', bookingData);
      set((state) => ({
        bookings: [...state.bookings, response.data.booking],
        currentBooking: response.data.booking,
        isLoading: false,
      }));
      return response.data.booking;
    } catch (error) {
      const message = error.response?.data?.message || 'Booking failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  fetchBookings: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/bookings');
      set({ bookings: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bookings', isLoading: false });
    }
  },

  updateBooking: async (id, data) => {
    try {
      const response = await api.put(`/bookings/${id}`, data);
      set((state) => ({
        bookings: state.bookings.map((b) => (b._id === id ? response.data : b)),
      }));
      return response.data;
    } catch (error) {
      set({ error: 'Failed to update booking' });
      throw error;
    }
  },
}));

export const usePaymentStore = create((set) => ({
  payments: [],
  isLoading: false,
  error: null,

  createPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/payments', paymentData);
      set((state) => ({
        payments: [...state.payments, response.data.payment],
        isLoading: false,
      }));
      return response.data.payment;
    } catch (error) {
      const message = error.response?.data?.message || 'Payment failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  fetchPayments: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/payments');
      set({ payments: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payments', isLoading: false });
    }
  },
}));

export const useVehicleStore = create((set) => ({
  vehicles: [],
  isLoading: false,
  error: null,

  fetchVehicles: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/vehicles');
      set({ vehicles: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch vehicles', isLoading: false });
    }
  },

  addVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/vehicles', vehicleData);
      set((state) => ({
        vehicles: [...state.vehicles, response.data.vehicle],
        isLoading: false,
      }));
      return response.data.vehicle;
    } catch (error) {
      set({ isLoading: false, error: 'Failed to add vehicle' });
      throw error;
    }
  },
}));
