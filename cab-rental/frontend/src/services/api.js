import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  // No /auth/logout route on backend — handled client-side only
};

// ─── Bookings ────────────────────────────────────────────────
// Backend routes:
//   GET    /bookings          → admin only
//   GET    /bookings/user/me  → customer's own bookings
//   GET    /bookings/:id      → any auth
//   POST   /bookings          → customer create
//   POST   /bookings/:id/assign-driver → admin
//   POST   /bookings/:id/complete      → driver
//   PATCH  /bookings/:id/cancel        → customer/admin
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),                    // admin
  getUserBookings: () => api.get('/bookings/user/me'),            // FIX: was /bookings/user
  getById: (id) => api.get(`/bookings/${id}`),
  assignDriver: (id) => api.post(`/bookings/${id}/assign-driver`),
  complete: (id) => api.post(`/bookings/${id}/complete`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),     // FIX: was DELETE
};

// ─── Drivers ─────────────────────────────────────────────────
export const driversAPI = {
  register: (data) => api.post('/drivers/register', data),
  completeRegistration: (data) => api.put('/drivers/complete-registration', data),
  getProfile: () => api.get('/drivers/me'),
  toggleAvailability: (data) => api.patch('/drivers/toggle-availability', data),
  updateLocation: (coordinates) => api.patch('/drivers/update-location', { coordinates }),
  getAssignedRides: () => api.get('/drivers/assigned-rides'),
  getPendingRides: () => api.get('/drivers/pending-rides'),
  acceptRide: (rideId) => api.post(`/drivers/rides/${rideId}/accept`),
  rejectRide: (rideId, reason) => api.post(`/drivers/rides/${rideId}/reject`, { reason }),
  startRide: (rideId) => api.post(`/drivers/rides/${rideId}/start`),
  getEarnings: () => api.get('/drivers/earnings'),
  getRideHistory: (params) => api.get('/drivers/ride-history', { params }),
};

// ─── Parcels ─────────────────────────────────────────────────
export const parcelsAPI = {
  create: (data) => api.post('/parcels', data),
  getAll: () => api.get('/parcels'), // admin
  getMyParcels: () => api.get('/parcels/my-parcels'),
  getById: (id) => api.get(`/parcels/${id}`),
  assignDriver: (id, driverId) => api.post(`/parcels/${id}/assign-driver`, { driverId }),
  confirmPickup: (id, pickupProof) => api.post(`/parcels/${id}/confirm-pickup`, { pickupProof }),
  confirmDelivery: (id, deliveryProof) => api.post(`/parcels/${id}/confirm-delivery`, { deliveryProof }),
  cancel: (id, reason) => api.post(`/parcels/${id}/cancel`, { reason }),
};

// ─── Payments (Razorpay) ─────────────────────────────────────
// Backend routes:
//   POST /payments/create-order  → create Razorpay order
//   POST /payments/verify        → verify payment signature
//   GET  /payments/booking/:id   → payment for a booking
//   GET  /payments/user/me       → user payment history   FIX: was /payments/history
export const paymentsAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getHistory: () => api.get('/payments/user/me'),        // FIX: was /payments/history
};

// ─── Emergency & Safety ──────────────────────────────────────
export const emergencyAPI = {
  addContact: (data) => api.post('/emergency/contacts', data),
  getContacts: () => api.get('/emergency/contacts'),
  updateContact: (id, data) => api.put(`/emergency/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/emergency/contacts/${id}`),
  triggerSOS: (data) => api.post('/emergency/sos', data),
  shareLocation: (bookingId, location) => api.post(`/emergency/share-location/${bookingId}`, { location }),
  updateSettings: (data) => api.patch('/emergency/settings', data),
  getSOSAlerts: (params) => api.get('/emergency/sos-alerts', { params }),
  resolveAlert: (id, data) => api.patch(`/emergency/sos-alerts/${id}/resolve`, data),
};

// ─── Chat ────────────────────────────────────────────────────
export const chatAPI = {
  getMessages: (bookingId) => api.get(`/chat/booking/${bookingId}/messages`),
  sendMessage: (bookingId, message) => api.post(`/chat/booking/${bookingId}/message`, { message }),
  markAsRead: (bookingId) => api.patch(`/chat/booking/${bookingId}/read`),
  deleteHistory: (bookingId) => api.delete(`/chat/booking/${bookingId}/messages`),
};

// ─── Vehicles ────────────────────────────────────────────────
// Backend routes:
//   GET  /vehicles/search  → public search with lat/lng/type/rentalType
//   GET  /vehicles/:id     → public get by id
//   GET  /vehicles         → admin only (all vehicles)
//   POST /vehicles         → admin create
//   PUT  /vehicles/:id     → admin update
//   PATCH /vehicles/:id/toggle-availability → admin
//   DELETE /vehicles/:id   → admin delete
export const vehiclesAPI = {
  search: (params) => api.get('/vehicles/search', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  getAll: () => api.get('/vehicles'),                         // admin
  create: (data) => api.post('/vehicles', data),                  // admin
  update: (id, data) => api.put(`/vehicles/${id}`, data),           // admin
  toggle: (id) => api.patch(`/vehicles/${id}/toggle-availability`), // admin
  delete: (id) => api.delete(`/vehicles/${id}`),                // admin
};

// ─── Users ───────────────────────────────────────────────────
// Backend route: GET /users/me
// NOTE: /users/profile and PUT /users/profile do NOT exist on backend
// Using /users/me for getProfile; updateProfile added to backend
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

// ─── Reviews ─────────────────────────────────────────────────
// Backend routes:
//   POST /reviews           → create review
//   GET  /reviews/vehicle/:id → get vehicle reviews
// NOTE: /reviews/user/:id and /reviews/booking/:id do NOT exist on backend
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getByVehicle: (vehicleId) => api.get(`/reviews/vehicle/${vehicleId}`),
};

export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  // Drivers
  getAllDrivers: (params) => api.get('/admin/drivers', { params }),
  getPendingDrivers: () => api.get('/admin/drivers/pending'),
  approveDriver: (id) => api.post(`/admin/drivers/${id}/approve`),
  rejectDriver: (id, reason) => api.post(`/admin/drivers/${id}/reject`, { reason }),
  // Vehicles
  getAllVehicles: (params) => api.get('/admin/vehicles', { params }),
  getPendingVehicles: () => api.get('/admin/vehicles/pending'),
  addVehicle: (data) => api.post('/admin/vehicles', data),
  updateVehicle: (id, data) => api.put(`/admin/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/admin/vehicles/${id}`),
  approveVehicle: (id) => api.post(`/admin/vehicles/${id}/approve`),
  rejectVehicle: (id, reason) => api.post(`/admin/vehicles/${id}/reject`, { reason }),
  // Users
  getAllUsers: (params) => api.get('/admin/users', { params }),
  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  // Live tracking
  getLiveLocations: () => api.get('/admin/live-locations'),
  // SOS
  getSosAlerts: () => api.get('/admin/sos-alerts'),
  resolveSos: (id) => api.post(`/admin/sos-alerts/${id}/resolve`),
};


// ─── Tracking ────────────────────────────────────────────────
export const trackingAPI = {
  update: (data) => api.post('/tracking/update', data),
  getLive: (bookingId) => api.get(`/tracking/live/${bookingId}`),
  getHistory: (bookingId) => api.get(`/tracking/history/${bookingId}`),
  stop: (data) => api.post('/tracking/stop', data),
};

export default api;
