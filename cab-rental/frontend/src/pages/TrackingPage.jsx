import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Clock, AlertCircle, Phone, Shield } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Placeholder driver location (Delhi)
const DRIVER_POS = [28.6139, 77.2090];

const TrackingPage = () => {
  const { bookingId } = useParams();

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
            <MapContainer
              center={DRIVER_POS}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer url={DARK_TILE} attribution={DARK_TILE_ATTR} />
              <Marker position={DRIVER_POS}>
                <Popup>
                  <div className="text-xs font-semibold">🚗 Your Driver</div>
                  <div className="text-xs text-gray-500">En route to pickup</div>
                </Popup>
              </Marker>
            </MapContainer>
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
