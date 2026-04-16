import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isLoading: false,
  error: null,

  // OTP verification state
  pendingUserId: null,
  isEmailVerified: false,
  isPhoneVerified: false,
  devOtps: null, // { emailOtp, phoneOtp } — only in development

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', userData);
      const { userId, dev } = response.data;
      set({
        isLoading: false,
        pendingUserId: userId,
        isEmailVerified: false,
        isPhoneVerified: false,
        devOtps: dev || null
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  verifyOtp: async (code, type) => {
    const { pendingUserId } = get();
    if (!pendingUserId) throw new Error('No pending verification');
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/verify-otp', {
        userId: pendingUserId,
        code,
        type
      });
      const { isEmailVerified, isPhoneVerified, isFullyVerified } = response.data;
      set({
        isLoading: false,
        isEmailVerified,
        isPhoneVerified,
        pendingUserId: isFullyVerified ? null : pendingUserId
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  resendOtp: async (type) => {
    const { pendingUserId } = get();
    if (!pendingUserId) throw new Error('No pending verification');
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/resend-otp', {
        userId: pendingUserId,
        type
      });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  setPendingUserId: (userId) => set({ pendingUserId: userId }),

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      const { userId } = response.data;
      set({ isLoading: false, pendingUserId: userId });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  resetPassword: async (code, newPassword) => {
    const { pendingUserId } = get();
    if (!pendingUserId) throw new Error('No pending reset');
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/reset-password', {
        userId: pendingUserId,
        code,
        newPassword
      });
      set({ isLoading: false, pendingUserId: null });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Reset failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, refreshToken, user, isLoading: false });
      return response.data;
    } catch (error) {
      // Handle unverified account — redirect to verification
      if (error.response?.status === 403 && error.response?.data?.pendingVerification) {
        const data = error.response.data;
        set({
          isLoading: false,
          pendingUserId: data.userId,
          isEmailVerified: data.isEmailVerified,
          isPhoneVerified: data.isPhoneVerified,
          error: data.message
        });
      } else {
        const message = error.response?.data?.message || 'Login failed';
        set({ isLoading: false, error: message });
      }
      throw error;
    }
  },

  googleLogin: async (idToken, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/google', { idToken, role });
      const { token, refreshToken, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ token, refreshToken, user, isLoading: false });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (e) {
      // Best-effort server logout
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, token: null, refreshToken: null, pendingUserId: null });
  },

  isTokenExpired: () => {
    const { token } = get();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },

  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) throw new Error('No refresh token');

    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      set({ token: newToken, refreshToken: newRefreshToken });

      return newToken;
    } catch (error) {
      get().logout();
      throw error;
    }
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
