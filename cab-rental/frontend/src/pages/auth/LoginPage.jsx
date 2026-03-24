import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Users, Car, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/index';

const ROLE_TABS = [
  {
    id: 'customer',
    label: 'Customer',
    emoji: '🧑',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    activeBg: 'bg-blue-500',
  },
  {
    id: 'driver',
    label: 'Driver',
    emoji: '🚗',
    gradient: 'from-green-500 to-emerald-500',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    activeBg: 'bg-green-500',
  },
  {
    id: 'admin',
    label: 'Admin',
    emoji: '🛡️',
    gradient: 'from-purple-500 to-pink-500',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    activeBg: 'bg-purple-500',
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('customer');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const currentRole = ROLE_TABS.find(r => r.id === activeRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      const result = await login(formData.email, formData.password);
      // Verify the logged-in user's role matches the selected tab
      if (result.user?.role && result.user.role !== activeRole) {
        toast.error(`This account is registered as a ${result.user.role}, not ${activeRole}`);
        // Still logged in — redirect to the right dashboard
      }
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.pendingVerification) {
        toast.error('Please verify your account first');
        navigate('/register');
        return;
      }
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

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
          <div className="my-6 flex items-center gap-3">
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
