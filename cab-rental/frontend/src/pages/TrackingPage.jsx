import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';

const TrackingPage = () => {
  const { bookingId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft overflow-hidden"
        >
          {/* Map Section */}
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center relative overflow-hidden">
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl mb-4"
              >
                🗺️
              </motion.div>
              <p className="text-gray-600 font-medium">Real-time tracking map will appear here</p>
              <p className="text-sm text-gray-500 mt-2">Booking ID: {bookingId}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Trip Details</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Trip Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Route Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-green-500 mt-1">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup</p>
                      <p className="font-bold text-gray-900">123 Main Street</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-red-500 mt-1">
                      <Navigation size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dropoff</p>
                      <p className="font-bold text-gray-900">456 Park Avenue</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="text-blue-500 mt-1">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Time</p>
                      <p className="font-bold text-gray-900">15 minutes away</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Driver Information</h2>
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-4">👨‍💼</div>
                  <p className="font-bold text-gray-900 text-lg">John Doe</p>
                  <p className="text-gray-600 mb-4">⭐ 4.8 Rating</p>
                  <div className="bg-white rounded-lg p-4 font-bold text-gray-900">
                    🚗 Car - AB 1234 CD
                  </div>
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-yellow-900">Driver on the way</p>
                <p className="text-sm text-yellow-800">Please be ready with your luggage</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
              >
                📞 Call Driver
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="py-3 border-2 border-red-500 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                🚫 Cancel Ride
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackingPage;
