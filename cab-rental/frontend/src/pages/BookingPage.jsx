import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Car, ArrowRight, Calendar, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBookingStore } from '../store/index';

const BookingPage = () => {
  const navigate = useNavigate();
  const { createBooking, isLoading } = useBookingStore();
  const [vehicleType, setVehicleType] = useState('car');
  const [rentalType, setRentalType] = useState('driver-operated');
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    estimatedDistance: 10,
    estimatedDuration: 15,
    pickupTime: '',
    specialRequests: '',
  });

  // Calculate fare
  useEffect(() => {
    const baseFare = vehicleType === 'bike' ? 30 : 50;
    const perKm = vehicleType === 'bike' ? 7 : 12;
    const perMin = vehicleType === 'bike' ? 1 : 2;
    const surge = 1.2;

    const total =
      (baseFare +
        formData.estimatedDistance * perKm +
        formData.estimatedDuration * perMin) *
      surge;

    setEstimatedFare(total);
  }, [formData.estimatedDistance, formData.estimatedDuration, vehicleType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      toast.error('Please enter both pickup and dropoff locations');
      return;
    }

    if (!formData.pickupTime) {
      toast.error('Please select pickup date and time');
      return;
    }

    if (formData.estimatedDistance < 1) {
      toast.error('Distance must be at least 1 km');
      return;
    }

    if (formData.estimatedDuration < 5) {
      toast.error('Duration must be at least 5 minutes');
      return;
    }

    try {
      // Generate realistic coordinates based on location string hash
      const hashPickup = formData.pickupLocation.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const hashDropoff = formData.dropoffLocation.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      
      const bookingData = {
        vehicleType,
        rentalType,
        estimatedDistance: parseFloat(formData.estimatedDistance),
        estimatedDuration: parseFloat(formData.estimatedDuration),
        pickupLocation: { 
          address: formData.pickupLocation, 
          coordinates: [72.8 + (hashPickup % 100) / 1000, 19.0 + (hashPickup % 100) / 1000] 
        },
        dropoffLocation: { 
          address: formData.dropoffLocation, 
          coordinates: [72.8 + (hashDropoff % 100) / 1000, 19.0 + (hashDropoff % 100) / 1000] 
        },
        pickupTime: new Date(formData.pickupTime).toISOString(),
        specialRequests: formData.specialRequests || undefined,
      };

      const booking = await createBooking(bookingData);

      toast.success('🎉 Booking created successfully!');
      navigate(`/tracking/${booking._id}`);
    } catch (error) {
      console.error('Booking error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create booking';
      toast.error(errorMsg);
    }
  };

  const vehicles = [
    { id: 'bike', name: 'Bike', icon: '🏍️', price: 'Budget' },
    { id: 'car', name: 'Car', icon: '🚗', price: 'Standard' },
    { id: 'scooter', name: 'Scooter', icon: '🛴', price: 'Eco' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Book Your Ride</h1>
          <p className="text-xl text-gray-600 mb-8">Choose your vehicle and enter your journey details</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-8">
              {/* Vehicle Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Vehicle Type</h2>
                <div className="grid grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <motion.button
                      key={vehicle.id}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVehicleType(vehicle.id)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        vehicleType === vehicle.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-4xl mb-2">{vehicle.icon}</div>
                      <p className="font-bold text-gray-900">{vehicle.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{vehicle.price}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Rental Type */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rental Type</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['driver-operated', 'self-drive'].map((type) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRentalType(type)}
                      className={`p-4 rounded-xl border-2 transition-all font-bold ${
                        rentalType === type
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {type === 'driver-operated' ? '👨‍💼 With Driver' : '🚗 Self Drive'}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Location Fields */}
              <div className="mb-8 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <MapPin size={18} className="mr-2 text-green-500" />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                    placeholder="Enter pickup location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <MapPin size={18} className="mr-2 text-red-500" />
                    Dropoff Location
                  </label>
                  <input
                    type="text"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                    placeholder="Enter dropoff location"
                  />
                </div>
              </div>

              {/* Distance & Duration */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <ArrowRight size={18} className="mr-2 text-blue-500" />
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    name="estimatedDistance"
                    value={formData.estimatedDistance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                    min="1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Clock size={18} className="mr-2 text-orange-500" />
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                    min="1"
                  />
                </div>
              </div>

              {/* Pickup Time */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Calendar size={18} className="mr-2 text-purple-500" />
                  Pickup Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Special Requests */}
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-teal-500" />
                  Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 transition-colors resize-none"
                  placeholder="Any special requirements? (e.g., luggage space, child seat, etc.)"
                  rows="3"
                />
              </div>

              {/* Book Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <Car className="mr-2" size={24} />
                    Confirm Booking
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-soft p-8 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Fare Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Vehicle Type</span>
                  <span className="font-bold text-gray-900 capitalize">{vehicleType}</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-bold text-gray-900">{formData.estimatedDistance.toFixed(1)} km</span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-bold text-gray-900">{formData.estimatedDuration} min</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Estimated Fare</p>
                  <p className="text-4xl font-bold text-blue-600">₹{estimatedFare.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-2">✓ Includes surge pricing</p>
                </div>
              </div>

              {/* Features */}
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <p className="font-bold text-green-900 mb-3">✓ What's Included:</p>
                <div className="space-y-2 text-sm text-green-800">
                  <p>✓ Professional Driver</p>
                  <p>✓ Real-time Tracking</p>
                  <p>✓ Safe & Secure</p>
                  <p>✓ 24/7 Support</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
