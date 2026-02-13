import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import { MapPin, Navigation, Car, Clock, IndianRupee, ChevronDown, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateRidePrice, formatCurrency, calculateDistance, estimateDuration } from '../utils/pricing';
import { vehiclesAPI, bookingsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const libraries = ['places'];

export default function BookingPage() {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState(null);
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [rentalType, setRentalType] = useState('driver-operated');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [driverRefreshInterval, setDriverRefreshInterval] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });

  const center = {
    lat: 28.6139, // Delhi center
    lng: 77.2090
  };

  // Calculate route and pricing when both locations are set
  useEffect(() => {
    if (pickupLocation && dropoffLocation && window.google && rentalType === 'driver-operated') {
      calculateRoute();
    }
  }, [pickupLocation, dropoffLocation]);

  // Fetch available vehicles/drivers when pricing is calculated or rental type changes
  useEffect(() => {
    if (pickupLocation) {
      if (rentalType === 'self-drive') {
        fetchAvailableVehicles();
      } else if (rentalType === 'driver-operated') {
        fetchNearbyDrivers();
        // Auto-refresh drivers every 10 seconds
        const interval = setInterval(fetchNearbyDrivers, 10000);
        setDriverRefreshInterval(interval);

        return () => clearInterval(interval);
      }
    }
  }, [pricing, vehicleType, rentalType, pickupLocation]);

  // Cleanup driver refresh on unmount
  useEffect(() => {
    return () => {
      if (driverRefreshInterval) {
        clearInterval(driverRefreshInterval);
      }
    };
  }, [driverRefreshInterval]);

  const onPickupLoad = useCallback((autocomplete) => {
    setPickupAutocomplete(autocomplete);
  }, []);

  const onDropoffLoad = useCallback((autocomplete) => {
    setDropoffAutocomplete(autocomplete);
  }, []);

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete) {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address
        };
        setPickupLocation(location);
        map?.panTo({ lat: location.lat, lng: location.lng });
      }
    }
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocomplete) {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address
        };
        setDropoffLocation(location);
      }
    }
  };

  const calculateRoute = async () => {
    if (!pickupLocation || !dropoffLocation || !window.google) return;

    setIsCalculating(true);
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: { lat: pickupLocation.lat, lng: pickupLocation.lng },
        destination: { lat: dropoffLocation.lat, lng: dropoffLocation.lng },
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      setDirections(results);

      // Extract distance and duration from directions
      const route = results.routes[0]?.legs[0];
      if (route) {
        const distance = route.distance.value / 1000; // Convert to km
        const duration = route.duration.value / 60; // Convert to minutes

        // Calculate pricing
        const priceData = calculateRidePrice({
          distance,
          duration,
          vehicleType,
          rentalType,
          surgeMultiplier: 1.0 // TODO: Get from backend based on demand
        });

        setPricing(priceData);
      }
    } catch (error) {
      console.error('Route calculation failed:', error);
      toast.error('Unable to calculate route. Please try different locations.');
    } finally {
      setIsCalculating(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const params = {
        lat: pickupLocation.lat,
        lng: pickupLocation.lng,
        vehicleType,
        rentalType: 'self-drive',
        maxDistance: 10000 // 10 km radius
      };

      const response = await vehiclesAPI.search(params);
      setAvailableVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchNearbyDrivers = async () => {
    if (!pickupLocation) return;

    try {
      const response = await api.get('/vehicles/nearby-drivers', {
        params: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng,
          vehicleType,
          maxDistance: 5000 // 5 km radius
        }
      });
      setNearbyDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Failed to fetch nearby drivers:', error);
    }
  };

  const handleBooking = async () => {
    // Validation based on rental type
    if (rentalType === 'self-drive') {
      if (!selectedVehicle) {
        toast.error('Please select a vehicle');
        return;
      }
      if (!pickupLocation) {
        toast.error('Please set pickup location');
        return;
      }
    } else {
      if (!pickupLocation || !dropoffLocation) {
        toast.error('Please set pickup and dropoff locations');
        return;
      }
      if (!pricing) {
        toast.error('Please wait for price calculation');
        return;
      }
    }

    setIsBooking(true);
    try {
      const bookingData = {
        vehicleId: rentalType === 'self-drive' ? selectedVehicle._id : null,
        pickupLocation: {
          address: pickupLocation.address,
          coordinates: [pickupLocation.lng, pickupLocation.lat]
        },
        dropoffLocation: dropoffLocation ? {
          address: dropoffLocation.address,
          coordinates: [dropoffLocation.lng, dropoffLocation.lat]
        } : null,
        vehicleType,
        rentalType,
        estimatedDistance: pricing?.distance || 0,
        estimatedDuration: pricing?.duration || 0,
        totalAmount: pricing?.total || (selectedVehicle?.pricePerDay || 0)
      };

      const response = await bookingsAPI.create(bookingData);

      toast.success('Booking created successfully!');
      navigate(`/payment/${response.data.booking._id}`);
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const vehicleOptions = [
    { value: 'car', label: 'Car', icon: '🚗', description: 'Comfortable for 4 people' },
    { value: 'bike', label: 'Bike', icon: '🏍️', description: 'Quick and economical' },
    { value: 'scooter', label: 'Scooter', icon: '🛵', description: 'Perfect for short trips' }
  ];

  const rentalOptions = [
    { value: 'driver-operated', label: 'With Driver', description: 'Chauffeur driven' },
    { value: 'self-drive', label: 'Self Drive', description: 'Drive yourself' }
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Book Your Ride</h1>
          <p className="text-sm text-gray-600 mt-1">Choose your destination and vehicle</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Booking Form */}
          <div className="lg:col-span-1 space-y-4">
            {/* Location Inputs Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>

              <div className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1 text-green-600" />
                    Pickup Location
                  </label>
                  <Autocomplete
                    onLoad={onPickupLoad}
                    onPlaceChanged={onPickupPlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </Autocomplete>
                </div>

                {/* Dropoff Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Navigation className="inline w-4 h-4 mr-1 text-red-600" />
                    Dropoff Location
                  </label>
                  <Autocomplete
                    onLoad={onDropoffLoad}
                    onPlaceChanged={onDropoffPlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder="Enter destination"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </Autocomplete>
                </div>
              </div>
            </div>

            {/* Vehicle Type Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Select Vehicle Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {vehicleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setVehicleType(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${vehicleType === option.value
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">{option.icon}</div>
                    <div className="text-xs font-medium text-gray-900">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rental Type Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Rental Type</h3>
              <div className="space-y-2">
                {rentalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRentalType(option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${rentalType === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${rentalType === option.value ? 'border-blue-600' : 'border-gray-300'
                        }`}>
                        {rentalType === option.value && (
                          <div className="w-3 h-3 rounded-full bg-blue-600" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            {pricing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
              >
                <h3 className="text-sm font-semibold mb-4 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Price Breakdown
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-white/20">
                    <span className="text-blue-100">Base Fare</span>
                    <span className="font-semibold">{formatCurrency(pricing.breakdown.baseFare)}</span>
                  </div>

                  {pricing.breakdown.distanceFare > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Distance ({pricing.distance.toFixed(1)} km)</span>
                      <span className="font-semibold">{formatCurrency(pricing.breakdown.distanceFare)}</span>
                    </div>
                  )}

                  {pricing.breakdown.timeFare > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Time ({Math.round(pricing.duration)} min)</span>
                      <span className="font-semibold">{formatCurrency(pricing.breakdown.timeFare)}</span>
                    </div>
                  )}

                  {pricing.breakdown.hourlyFare > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Hourly Charges</span>
                      <span className="font-semibold">{formatCurrency(pricing.breakdown.hourlyFare)}</span>
                    </div>
                  )}

                  {pricing.breakdown.surgePricing > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Surge ({pricing.surgeMultiplier}x)</span>
                      <span className="font-semibold">{formatCurrency(pricing.breakdown.surgePricing)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Platform Fee (5%)</span>
                    <span className="font-semibold">{formatCurrency(pricing.breakdown.platformFee)}</span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-white/20">
                    <span className="text-blue-100">GST (18%)</span>
                    <span className="font-semibold">{formatCurrency(pricing.breakdown.gst)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold">{formatCurrency(pricing.total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-xs text-blue-100">
                  <Clock className="w-4 h-4 mr-2" />
                  Estimated duration: {Math.round(pricing.duration)} minutes
                </div>
              </motion.div>
            )}

            {/* Available Vehicles or Nearby Drivers */}
            {rentalType === 'self-drive' && availableVehicles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Available Vehicles ({availableVehicles.length})
                </h3>
                <div className="space-y-3">
                  {availableVehicles.slice(0, 5).map((vehicle) => (
                    <button
                      key={vehicle._id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedVehicle?._id === vehicle._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {vehicle.licensePlate} • {vehicle.rating || 0}⭐ • {vehicle.seatCapacity} seats
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{vehicle.pricePerHour}/hr
                          </div>
                          <div className="text-xs text-gray-500">₹{vehicle.pricePerDay}/day</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {rentalType === 'driver-operated' && nearbyDrivers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Nearby Drivers ({nearbyDrivers.length})
                  </h3>
                  <div className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2" />
                    Live
                  </div>
                </div>
                <div className="space-y-3">
                  {nearbyDrivers.slice(0, 5).map((driver) => (
                    <div
                      key={driver._id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {driver.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {driver.phone} • {driver.rating || 0}⭐ • {driver.totalRides || 0} rides
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={
                isBooking ||
                (rentalType === 'self-drive' ? !selectedVehicle : (!pricing || !dropoffLocation))
              }
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
            >
              {isBooking ? 'Creating Booking...' : (
                rentalType === 'self-drive'
                  ? (selectedVehicle ? 'Proceed to Payment' : 'Select a Vehicle')
                  : (pricing ? 'Proceed to Payment' : 'Set Locations First')
              )}
            </button>
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '800px' }}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={pickupLocation || center}
                zoom={pickupLocation ? 13 : 11}
                onLoad={setMap}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true
                }}
              >
                {pickupLocation && (
                  <Marker
                    position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                    icon={{
                      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzEwYjk4MSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+'
                    }}
                    label="Pickup"
                  />
                )}

                {dropoffLocation && rentalType === 'driver-operated' && (
                  <Marker
                    position={{ lat: dropoffLocation.lat, lng: dropoffLocation.lng }}
                    icon={{
                      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2VmNDQ0NCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjgiIGZpbGw9IndoaXRlIi8+PC9zdmc+'
                    }}
                    label="Dropoff"
                  />
                )}

                {/* Show nearby drivers */}
                {rentalType === 'driver-operated' && nearbyDrivers.map((driver) => (
                  <Marker
                    key={driver._id}
                    position={{
                      lat: driver.currentLocation?.coordinates[1] || 0,
                      lng: driver.currentLocation?.coordinates[0] || 0
                    }}
                    icon={{
                      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzM2OTJkMiIvPjx0ZXh0IHg9IjIwIiB5PSIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiPvCfmpc8L3RleHQ+PC9zdmc+'
                    }}
                    title={`Driver: ${driver.name}`}
                  />
                ))}

                {directions && rentalType === 'driver-operated' && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
