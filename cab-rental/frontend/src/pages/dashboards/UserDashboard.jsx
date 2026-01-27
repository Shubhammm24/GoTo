import { motion } from 'framer-motion';
import { LogOut, Settings, CreditCard, MapPin, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const UserDashboard = () => {
  const [user] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    avatar: '👨',
    rating: 4.8,
    totalRides: 23,
    totalSpent: 8450,
    joinDate: '2024-01-01',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-8 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="text-6xl">{user.avatar}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600 mt-2">{user.email}</p>
                <p className="text-gray-600">{user.phone}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <span className="text-yellow-400">{'⭐'.repeat(Math.floor(user.rating))}</span>
                  <span className="font-bold text-gray-900">{user.rating}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                <Settings size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Rides', value: user.totalRides, icon: '🚗', color: 'blue' },
            { label: 'Total Spent', value: `₹${user.totalSpent}`, icon: '💰', color: 'green' },
            { label: 'Rating', value: user.rating, icon: '⭐', color: 'yellow' },
            { label: 'Member Since', value: '1 year', icon: '📅', color: 'purple' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className={`bg-white rounded-2xl shadow-soft p-6 border-l-4 border-${stat.color}-500`}
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-gray-600 text-sm font-bold">{stat.label}</p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { title: 'Book a Ride', icon: MapPin, color: 'blue', link: '/booking' },
            { title: 'Ride History', icon: TrendingUp, color: 'green', link: '/history' },
            { title: 'Wallet & Payments', icon: CreditCard, color: 'purple', link: '/payment' },
          ].map((action, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              as={Link}
              to={action.link}
              className="bg-white rounded-2xl shadow-soft p-8 text-center cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className={`w-16 h-16 rounded-full bg-${action.color}-100 flex items-center justify-center mx-auto mb-4`}>
                <action.icon className={`text-${action.color}-600`} size={32} />
              </div>
              <p className="text-xl font-bold text-gray-900">{action.title}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming Rides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Rides</h2>
          <div className="text-center py-8">
            <p className="text-4xl mb-2">🎯</p>
            <p className="text-gray-600">No upcoming rides scheduled</p>
            <Link to="/booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors"
              >
                Book Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
