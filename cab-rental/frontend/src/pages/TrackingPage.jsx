import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, AlertCircle, Phone, Shield } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const LIBRARIES = ['places'];

const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0a0f1e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0f1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#374151' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c1825' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d1d5db' }] },
];

// Placeholder driver location (Delhi — will be replaced by real socket coords)
const DRIVER_POS = { lat: 28.6139, lng: 77.2090 };

const DRIVER_ICON = {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="20" fill="#f97415" fill-opacity="0.25"/>
      <circle cx="20" cy="20" r="14" fill="#f97415"/>
      <text x="20" y="26" text-anchor="middle" font-size="16">🚗</text>
    </svg>`),
  scaledSize: { width: 40, height: 40 },
  anchor: { x: 20, y: 20 },
};

const TrackingPage = () => {
  const { bookingId } = useParams();
  const [showInfo, setShowInfo] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  return (
    <div className="min-h-screen bg-bg-dark py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {/* Live Map */}
          <div className="w-full" style={{ height: '380px' }}>
            {!isLoaded && !loadError && (
              <div className="w-full h-full flex items-center justify-center bg-surface-2">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {loadError && (
              <div className="w-full h-full flex items-center justify-center bg-surface-2">
                <p className="text-white/30 text-sm">Map unavailable</p>
              </div>
            )}
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={DRIVER_POS}
                zoom={14}
                options={{
                  styles: DARK_MAP_STYLES,
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                  gestureHandling: 'greedy',
                }}
              >
                <Marker
                  position={DRIVER_POS}
                  icon={DRIVER_ICON}
                  onClick={() => setShowInfo(true)}
                  animation={window.google?.maps?.Animation?.BOUNCE}
                />
                {showInfo && (
                  <InfoWindow position={DRIVER_POS} onCloseClick={() => setShowInfo(false)}>
                    <div style={{ color: '#111', fontSize: 12 }}>
                      <b>🚗 Your Driver</b><br />
                      <span>En route to pickup</span>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>

          {/* Details */}
          <div className="p-6">
            {/* Status Banner */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              <div>
                <p className="text-primary font-bold text-sm">Driver on the way</p>
                <p className="text-white/40 text-xs">Booking ID: {bookingId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route Info */}
              <div>
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-wide mb-4">Route</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={14} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Pickup</p>
                      <p className="text-white font-semibold text-sm">123 Main Street</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Navigation size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">Dropoff</p>
                      <p className="text-white font-semibold text-sm">456 Park Avenue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={14} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-xs">ETA</p>
                      <p className="text-white font-semibold text-sm">~15 minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div>
                <h2 className="text-sm font-bold text-white/50 uppercase tracking-wide mb-4">Driver</h2>
                <div className="glass-card rounded-xl p-4 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl mx-auto mb-3">
                    👨‍💼
                  </div>
                  <p className="text-white font-bold">John Doe</p>
                  <p className="text-white/40 text-xs mt-0.5">⭐ 4.8 · 142 rides</p>
                  <div className="mt-3 px-3 py-2 bg-surface-2/50 rounded-lg text-white/60 text-xs font-mono">
                    🚗 AB 1234 CD
                  </div>
                </div>
              </div>
            </div>

            {/* Alert */}
            <div className="mt-5 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle size={16} className="text-yellow-400 shrink-0" />
              <p className="text-yellow-300 text-xs font-medium">Please be ready at the pickup point with your luggage.</p>
            </div>

            {/* Actions */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-500/25 transition-all"
              >
                <Phone size={16} />
                Call Driver
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
              >
                <Shield size={16} />
                SOS Alert
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackingPage;
