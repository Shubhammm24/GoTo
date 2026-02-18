import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/index';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import TrackingPage from './pages/TrackingPage';
import UserDashboard from './pages/dashboards/UserDashboard';
import DriverDashboard from './pages/dashboards/DriverDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import RideHistoryPage from './pages/RideHistoryPage';
import ReviewsPage from './pages/ReviewsPage';
import ParcelBookingPage from './pages/ParcelBookingPage';
import VehicleManagement from './pages/admin/VehicleManagement';

// Components
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-bg-dark text-white">
        <NavBar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/booking"
              element={
                <ProtectedRoute requiredRole="customer">
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parcel"
              element={
                <ProtectedRoute requiredRole="customer">
                  <ParcelBookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment/:bookingId"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracking/:bookingId"
              element={
                <ProtectedRoute>
                  <TrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute requiredRole="customer">
                  <RideHistoryPage />
                </ProtectedRoute>
              }
            />
            {/* Alias used by parcel booking */}
            <Route
              path="/ride-history"
              element={
                <ProtectedRoute requiredRole="customer">
                  <RideHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <ReviewsPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Routes */}
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute requiredRole="customer">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/driver"
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vehicles"
              element={
                <ProtectedRoute requiredRole="admin">
                  <VehicleManagement />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#f97415', secondary: '#111827' },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
