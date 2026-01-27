import { motion } from 'framer-motion';
import { TrendingUp, MapPin, DollarSign, Clock, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

const DriverDashboard = () => {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [rideRequests] = useState([
    {
      id: 1,
      passenger: 'Sarah Johnson',
      rating: 4.8,
      pickupLocation: 'Downtown Mall',
      dropoffLocation: 'Central Hotel',
      estimatedFare: 350,
      distance: 8.5,
      avatar: '👩',
    },
    {
      id: 2,
      passenger: 'Mike Wilson',
      rating: 4.6,
      pickupLocation: 'Airport Terminal 3',
      dropoffLocation: 'City Center',
      estimatedFare: 520,
      distance: 15.2,
      avatar: '👨',
    },
  ]);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Duty Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, Driver!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOnDuty(!isOnDuty)}
              className={`px-8 py-3 rounded-full font-bold text-white transition-all ${
                isOnDuty
                  ? 'bg-green-500 shadow-lg hover:bg-green-600'
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {isOnDuty ? '🟢 On Duty' : '⚫ Off Duty'}
            </motion.button>
          </div>
        </motion.div>

        {/* Earnings Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "Today's Earnings", value: '₹1,850', icon: '💵', color: 'green' },
            { label: "Week's Earnings", value: '₹9,250', icon: '📈', color: 'blue' },
            { label: "Month's Earnings", value: '₹35,400', icon: '💰', color: 'purple' },
            { label: 'Trips Completed', value: '142', icon: '✓', color: 'emerald' },
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

        {/* Active Ride Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-soft p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Incoming Ride Requests ({rideRequests.length})
          </h2>

          <div className="space-y-4">
            {rideRequests.length > 0 ? (
              rideRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{request.avatar}</div>
                      <div>
                        <p className="font-bold text-gray-900">{request.passenger}</p>
                        <div className="flex items-center space-x-1 text-sm">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-gray-600">{request.rating}</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Phone className="text-blue-600" size={20} />
                    </motion.button>
                  </div>

                  {/* Route */}
                  <div className="flex items-start space-x-4 mb-4 py-4 border-y border-green-200">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-1 h-12 bg-green-300 my-1"></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Pickup</p>
                      <p className="font-bold text-gray-900 mb-3">{request.pickupLocation}</p>
                      <p className="text-sm text-gray-600 mb-1">Dropoff</p>
                      <p className="font-bold text-gray-900">{request.dropoffLocation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Distance</p>
                      <p className="font-bold text-gray-900">{request.distance} km</p>
                    </div>
                  </div>

                  {/* Fare & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-gray-600">Estimated Fare</p>
                        <p className="font-bold text-green-600 text-xl">₹{request.estimatedFare}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Accept</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center space-x-2"
                      >
                        <XCircle size={18} />
                        <span>Decline</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-4xl mb-4">🚗</p>
                <p className="text-lg font-bold text-gray-900">No active requests</p>
                <p className="text-gray-600 mt-2">Come online to receive ride requests</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Trip History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Trips</h2>
          <div className="space-y-3">
            {[
              { time: '10:30 AM', passenger: 'John Doe', earning: '₹280' },
              { time: '11:45 AM', passenger: 'Emma Smith', earning: '₹350' },
              { time: '2:15 PM', passenger: 'Alex Kumar', earning: '₹220' },
            ].map((trip, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-bold text-gray-900">{trip.passenger}</p>
                  <p className="text-sm text-gray-600">{trip.time}</p>
                </div>
                <p className="font-bold text-green-600">{trip.earning}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DriverDashboard;
