import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, History, MapPin, Bell } from 'lucide-react';
import { useAuthStore } from '../store/index';

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin': return '/dashboard/admin';
      case 'driver': return '/dashboard/driver';
      case 'customer': return '/dashboard/user';
      default: return null;
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = token
    ? [
      { to: '/', label: 'Home', icon: <MapPin size={15} /> },
      { to: '/booking', label: 'Book Ride', icon: null },
      { to: '/history', label: 'History', icon: <History size={15} /> },
      ...(getDashboardLink() ? [{ to: getDashboardLink(), label: 'Dashboard', icon: <LayoutDashboard size={15} /> }] : []),
    ]
    : [
      { to: '/', label: 'Home', icon: null },
    ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-neon-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
            </motion.div>
            <span className="font-bold text-xl text-white tracking-tight">
              Go<span className="text-primary">To</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.to)
                    ? 'bg-primary/15 text-primary'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {token ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2/50 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold leading-tight">{user?.name?.split(' ')[0]}</span>
                    <span className="text-white/40 text-[10px] capitalize">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition-all"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-neon-sm transition-all"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/5"
          >
            <div className="px-4 py-4 space-y-1 bg-surface/80 backdrop-blur-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.to)
                      ? 'bg-primary/15 text-primary'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-white/5 mt-2">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 text-sm font-medium transition-all text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-semibold text-center shadow-neon-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
