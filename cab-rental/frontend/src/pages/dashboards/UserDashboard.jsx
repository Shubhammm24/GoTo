import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MapPin, TrendingUp, CreditCard, Star, Clock, Car, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const stats = [
    { label: 'Total Rides', value: '23', icon: <Car size={20} />, color: 'text-primary', bg: 'bg-primary/10', change: '+3 this month' },
    { label: 'Total Spent', value: '₹8,450', icon: <CreditCard size={20} />, color: 'text-green-400', bg: 'bg-green-500/10', change: '₹1,200 this month' },
    { label: 'Avg Rating', value: '4.8', icon: <Star size={20} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10', change: 'Top 10% rider' },
    { label: 'Member Since', value: '1 yr', icon: <Clock size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10', change: 'Jan 2024' },
  ];

  const quickActions = [
    { title: 'Book a Ride', desc: 'Find a driver now', icon: <MapPin size={24} />, link: '/booking', color: 'text-primary', bg: 'bg-primary/10 hover:bg-primary/20 border-primary/20' },
    { title: 'Ride History', desc: 'View past trips', icon: <TrendingUp size={24} />, link: '/history', color: 'text-green-400', bg: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20' },
    { title: 'Payments', desc: 'Manage wallet', icon: <CreditCard size={24} />, link: '/payment', color: 'text-blue-400', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
  ];

  const recentRides = [
    { from: 'Home', to: 'Office', date: 'Today, 9:00 AM', fare: '₹180', status: 'completed' },
    { from: 'Mall', to: 'Airport', date: 'Yesterday, 3:30 PM', fare: '₹420', status: 'completed' },
    { from: 'Gym', to: 'Home', date: '2 days ago', fare: '₹95', status: 'completed' },
  ];

  return (
    <div className="min-h-screen bg-bg-dark py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-2xl p-6 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-black text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name || 'John Doe'}</h1>
              <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
                ))}
                <span className="text-white/50 text-xs ml-1">4.8 rating</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-surface-2/50 text-white/50 hover:text-white hover:bg-white/10 transition-all">
              <Settings size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass-card rounded-2xl p-5 hover:border-white/15 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-3xl font-black text-white mb-0.5">{stat.value}</p>
              <p className="text-white/40 text-xs font-medium">{stat.label}</p>
              <p className="text-white/25 text-[10px] mt-1">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {quickActions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
            >
              <Link
                to={action.link}
                className={`flex items-center gap-4 p-5 rounded-2xl border glass-card ${action.bg} transition-all duration-200 group`}
              >
                <div className={`w-12 h-12 rounded-xl ${action.bg.split(' ')[0]} ${action.color} flex items-center justify-center shrink-0`}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-white font-bold group-hover:text-primary transition-colors">{action.title}</p>
                  <p className="text-white/40 text-sm">{action.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Rides */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Recent Rides</h2>
            <Link to="/history" className="text-primary text-sm font-medium hover:text-primary-dark transition-colors">
              View All →
            </Link>
          </div>

          {recentRides.length > 0 ? (
            <div className="space-y-3">
              {recentRides.map((ride, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-surface-2/30 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{ride.from} → {ride.to}</p>
                      <p className="text-white/40 text-xs">{ride.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{ride.fare}</p>
                    <span className="badge-completed">{ride.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-white/40 mb-4">No rides yet</p>
              <Link to="/booking" className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5">
                Book Your First Ride
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
