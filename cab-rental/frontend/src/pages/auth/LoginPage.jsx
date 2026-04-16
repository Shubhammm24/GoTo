import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/index';

const ROLE_TABS = [
  {
    id: 'customer',
    label: 'Customer',
    emoji: '🧑',
    activeBg: 'bg-blue-500',
    text: 'text-blue-400',
    dashboardPath: '/dashboard/user',
  },
  {
    id: 'driver',
    label: 'Driver',
    emoji: '🚗',
    activeBg: 'bg-green-500',
    text: 'text-green-400',
    dashboardPath: '/dashboard/driver',
  },
  {
    id: 'admin',
    label: 'Admin',
    emoji: '🛡️',
    activeBg: 'bg-purple-500',
    text: 'text-purple-400',
    dashboardPath: '/dashboard/admin',
  },
];

const ROLE_DASHBOARD = {
  customer: '/dashboard/user',
  driver: '/dashboard/driver',
  admin: '/dashboard/admin',
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('customer');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const currentRole = ROLE_TABS.find(r => r.id === activeRole);

  // Redirect to the correct dashboard based on role
  const redirectByRole = (role) => {
    const path = ROLE_DASHBOARD[role] || '/';
    navigate(path);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const result = await login(formData.email, formData.password);
      const userRole = result.user?.role;

      // Warn if the role doesn't match the selected tab (but still log in)
      if (userRole && userRole !== activeRole) {
        toast.error(`This account is a ${userRole} account. Redirecting to ${userRole} dashboard.`);
      } else {
        toast.success('Welcome back!');
      }
      redirectByRole(userRole || activeRole);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.pendingVerification) {
        toast.error('Please verify your account first');
        navigate('/register');
        return;
      }
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  // Google Login — receives credential (ID token) from Google popup
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      // tokenResponse.access_token is from the implicit flow
      // We need to exchange it for user info. Use the credential flow instead.
      const result = await googleLogin(tokenResponse.credential || tokenResponse.access_token, activeRole);
      const userRole = result.user?.role;
      toast.success(`Welcome back, ${result.user?.name?.split(' ')[0] || 'there'}! 🎉`);
      redirectByRole(userRole || activeRole);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign-in failed');
    }
  };

  // Use useGoogleLogin from @react-oauth/google — credential flow
  const googleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // tokenResponse.access_token — use to get user info
      try {
        // Fetch user info from Google using access_token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        // Build an ID token-like payload and send access_token to backend
        const result = await googleLogin(tokenResponse.access_token, activeRole);
        const userRole = result.user?.role;
        toast.success(`Welcome back, ${result.user?.name?.split(' ')[0] || 'there'}! 🎉`);
        redirectByRole(userRole || activeRole);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Google sign-in failed');
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      toast.error('Google sign-in was cancelled or failed');
    },
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 map-grid-bg opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-neon mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white">
            Go<span className="text-primary">To</span>
          </h1>
          <p className="text-white/40 mt-1 text-sm">Welcome back — sign in to continue</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-glass">
          {/* ─── Role Tabs ─── */}
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl">
            {ROLE_TABS.map((role) => (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex-1 relative flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeRole === role.id
                    ? `${role.activeBg} text-white shadow-lg`
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <span className="text-sm">{role.emoji}</span>
                {role.label}
                {activeRole === role.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Role-specific subtitle */}
          <AnimatePresence mode="wait">
            <motion.p
              key={activeRole}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className={`text-center text-xs mb-5 ${currentRole?.text}`}
            >
              {activeRole === 'customer' && '📍 Book rides, track deliveries & manage trips'}
              {activeRole === 'driver' && '🚗 Accept rides, earn money & manage schedule'}
              {activeRole === 'admin' && '🛡️ Manage platform, users, vehicles & analytics'}
            </motion.p>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-dark pl-11"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-dark pl-11 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-surface-2 accent-primary" />
                <span className="text-sm text-white/50">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              id="login-submit"
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                currentRole?.activeBg || 'bg-primary'
              } hover:opacity-90`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In as {currentRole?.label}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign-In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => googleSignIn()}
            disabled={isLoading}
            id="google-signin-btn"
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-white/90 bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Google SVG Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">New to GoTo?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link
            to="/register"
            className="w-full btn-ghost flex items-center justify-center gap-2 py-3"
          >
            Create an Account
          </Link>
        </div>

        {/* Security badge */}
        <div className="mt-4 glass-card rounded-2xl px-5 py-3 flex items-center justify-center gap-2">
          <AlertCircle size={14} className="text-primary" />
          <p className="text-white/30 text-xs">Protected by OTP verification & encrypted sessions</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
