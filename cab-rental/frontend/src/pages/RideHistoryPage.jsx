import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Clock, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const RideHistoryPage = () => {
  const [filter, setFilter] = useState('all');

  const rides = [
    {
      id: 1,
      date: '2024-01-15',
      from: 'Downtown Station',
      to: 'Airport',
      distance: 25.5,
      duration: 35,
      fare: 425,
      driver: 'Raj Kumar',
      rating: 5,
    },
    {
      id: 2,
      date: '2024-01-12',
      from: 'Home',
      to: 'Office',
      distance: 8.2,
      duration: 20,
      fare: 150,
      driver: 'Priya Singh',
      rating: 4,
    },
    {
      id: 3,
      date: '2024-01-10',
      from: 'Mall',
      to: 'Hotel',
      distance: 12.4,
      duration: 25,
      fare: 210,
      driver: 'Amit Patel',
      rating: 5,
    },
  ];

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
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Ride History</h1>
          <div className="flex space-x-4">
            {['all', 'week', 'month'].map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  filter === f
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { label: 'Total Rides', value: '23', icon: '🚗' },
            { label: 'Total Distance', value: '450 km', icon: '📍' },
            { label: 'Total Spent', value: '₹8,450', icon: '💰' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-soft p-6 text-center"
            >
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Rides List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {rides.map((ride) => (
            <motion.div
              key={ride.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-soft p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Route */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-1 h-12 bg-gray-300 my-1"></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{ride.from}</p>
                      <p className="text-gray-600 text-sm mb-2">Pickup location</p>
                      <p className="font-bold text-gray-900 mt-4">{ride.to}</p>
                      <p className="text-gray-600 text-sm">Dropoff location</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                        <Calendar size={16} />
                        <span>Date</span>
                      </div>
                      <p className="font-bold text-gray-900">{new Date(ride.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                        <MapPin size={16} />
                        <span>Distance</span>
                      </div>
                      <p className="font-bold text-gray-900">{ride.distance} km</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                        <Clock size={16} />
                        <span>Duration</span>
                      </div>
                      <p className="font-bold text-gray-900">{ride.duration} min</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm mb-1">
                        <DollarSign size={16} />
                        <span>Fare</span>
                      </div>
                      <p className="font-bold text-blue-600">₹{ride.fare}</p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Driver</p>
                      <p className="font-bold text-gray-900">{ride.driver}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < ride.rating ? '⭐' : '☆'}>
                          {i < ride.rating ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <motion.div
                  whileHover={{ x: 5 }}
                  className="ml-4"
                >
                  <ChevronRight className="text-gray-400" size={24} />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {rides.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-4xl mb-4">🚗</p>
            <p className="text-xl font-bold text-gray-900">No rides yet</p>
            <p className="text-gray-600 mt-2">Start your journey with us today!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RideHistoryPage;
