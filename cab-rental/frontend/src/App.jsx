import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/index';
import { lazy, Suspense } from 'react';

// Components (kept as static imports — small, used everywhere)
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages — lazy loaded for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const UserDashboard = lazy(() => import('./pages/dashboards/UserDashboard'));
const DriverDashboard = lazy(() => import('./pages/dashboards/DriverDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const RideHistoryPage = lazy(() => import('./pages/RideHistoryPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const ParcelBookingPage = lazy(() => import('./pages/ParcelBookingPage'));
const VehicleManagement = lazy(() => import('./pages/admin/VehicleManagement'));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const { token } = useAuthStore();

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col bg-bg-dark text-white">
          <NavBar />

          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />
                <Route path="/forgot-password" element={token ? <Navigate to="/" /> : <ForgotPasswordPage />} />

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
            </Suspense>
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
    </ErrorBoundary>
  );
}

export default App;
