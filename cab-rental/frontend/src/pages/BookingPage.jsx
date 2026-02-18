import { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Navigation, Clock, IndianRupee, X, Loader2,
  Crosshair, Package, Car, Bike, ChevronRight, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateRidePrice, formatCurrency } from '../utils/pricing';
import { vehiclesAPI, bookingsAPI, parcelsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ─── Leaflet Icon Fix ────────────────────────────────────── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const mkIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const pickupIcon = mkIcon('green');
const dropoffIcon = mkIcon('red');
const driverIcon = mkIcon('orange');

/* ─── Map Helpers ─────────────────────────────────────────── */
function MapClickHandler({ onSelect, active }) {
  useMapEvents({
    click: async (e) => {
      if (!active) return;
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        onSelect({ lat, lng, address: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      } catch {
        onSelect({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      }
    },
  });
  return null;
}

function FlyTo({ pos }) {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo([pos.lat, pos.lng], 14, { duration: 1 }); }, [pos]);
  return null;
}

/* ─── Nominatim Search ────────────────────────────────────── */
function LocationInput({ label, icon, iconColor, value, onSelect, placeholder }) {
  const [q, setQ] = useState(value?.address || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => { setQ(value?.address || ''); }, [value]);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const search = (val) => {
    setQ(val);
    clearTimeout(timer.current);
    if (val.length < 3) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&countrycodes=in`);
        const data = await res.json();
        setResults(data.map(r => ({ display_name: r.display_name, lat: +r.lat, lng: +r.lon })));
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
  };

  const pick = (r) => {
    setQ(r.display_name);
    onSelect({ lat: r.lat, lng: r.lng, address: r.display_name });
    setResults([]); setOpen(false);
  };

  const clear = () => { setQ(''); onSelect(null); setResults([]); };

  return (
    <div ref={ref} className="relative">
      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconColor}`}>{icon}</span>
        <input
          value={q}
          onChange={e => search(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
        />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 animate-spin" />}
        {q && !loading && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={13} />
          </button>
        )}
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute z-[9999] top-full mt-1 w-full rounded-xl border border-white/10 overflow-hidden shadow-glass"
            style={{ background: 'rgba(17,24,39,0.97)', backdropFilter: 'blur(20px)' }}
          >
            {results.map((r, i) => (
              <button key={i} onClick={() => pick(r)}
                className="w-full text-left px-3 py-2.5 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0 flex items-start gap-2">
                <MapPin size={10} className="text-primary mt-0.5 shrink-0" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Constants ───────────────────────────────────────────── */
const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
const INDIA_CENTER = [20.5937, 78.9629];

const SERVICE_TABS = [
  { id: 'ride', label: 'Book Ride', icon: '🚗' },
  { id: 'parcel', label: 'Parcel', icon: '📦' },
  { id: 'self-drive', label: 'Self Drive', icon: '🔑' },
];

const VEHICLE_TYPES = [
  { value: 'bike', label: 'Bike', icon: '🏍️', desc: 'Quick & cheap' },
  { value: 'car', label: 'Sedan', icon: '🚗', desc: '4 passengers' },
  { value: 'suv', label: 'SUV', icon: '🚙', desc: '6 passengers' },
];

// parcelSize maps to weight in kg for the backend
const PARCEL_SIZES = [
  { value: 'small', label: 'Small', desc: 'Up to 2 kg', icon: '📦', weight: 1, vehicleType: 'bike' },
  { value: 'medium', label: 'Medium', desc: 'Up to 10 kg', icon: '📫', weight: 5, vehicleType: 'bike' },
  { value: 'large', label: 'Large', desc: 'Up to 30 kg', icon: '🗃️', weight: 15, vehicleType: 'car' },
];

/* ─── Haversine Distance ──────────────────────────────────── */
function haversine(a, b) {
  const R = 6371, toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/* ─── Main Component ──────────────────────────────────────── */
export default function BookingPage() {
  const navigate = useNavigate();

  // Service tab
  const [tab, setTab] = useState('ride'); // 'ride' | 'parcel' | 'self-drive'

  // Locations
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [flyPos, setFlyPos] = useState(null);

  // Map click mode: 'pickup' | 'dropoff' | null
  const [clickMode, setClickMode] = useState(null);

  // GPS loading
  const [gpsLoading, setGpsLoading] = useState(false);

  // Ride / self-drive
  const [vehicleType, setVehicleType] = useState('car');
  const [pricing, setPricing] = useState(null);
  const [isCalc, setIsCalc] = useState(false);

  // Self-drive vehicles
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [rentalDays, setRentalDays] = useState(1);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('car');

  // Parcel
  const [parcelSize, setParcelSize] = useState('small');
  const [parcelDesc, setParcelDesc] = useState('');
  const [parcelFragile, setParcelFragile] = useState(false);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');

  // Booking
  const [isBooking, setIsBooking] = useState(false);

  /* ── GPS: Use Current Location ─────────────────────────── */
  const useCurrentLocation = useCallback((field) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setGpsLoading(field);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const loc = { lat, lng, address: data.display_name || 'Current Location' };
          if (field === 'pickup') { setPickup(loc); setFlyPos(loc); }
          else { setDropoff(loc); setFlyPos(loc); }
          toast.success(`${field === 'pickup' ? 'Pickup' : 'Dropoff'} set to current location`);
        } catch {
          const loc = { lat, lng, address: 'Current Location' };
          if (field === 'pickup') { setPickup(loc); setFlyPos(loc); }
          else { setDropoff(loc); setFlyPos(loc); }
        }
        setGpsLoading(null);
      },
      (err) => {
        setGpsLoading(null);
        toast.error('Could not get your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  /* ── Map click handler ─────────────────────────────────── */
  const handleMapClick = useCallback((loc) => {
    if (clickMode === 'pickup') { setPickup(loc); setFlyPos(loc); }
    if (clickMode === 'dropoff') { setDropoff(loc); setFlyPos(loc); }
    setClickMode(null);
  }, [clickMode]);

  /* ── Pricing ───────────────────────────────────────────── */
  useEffect(() => {
    if (pickup && dropoff && (tab === 'ride')) {
      setIsCalc(true);
      try {
        const dist = haversine(pickup, dropoff);
        const dur = (dist / 30) * 60;
        const p = calculateRidePrice({ distance: dist, duration: dur, vehicleType, rentalType: 'driver-operated', surgeMultiplier: 1.0 });
        setPricing(p);
      } catch (e) { console.error(e); }
      finally { setIsCalc(false); }
    } else {
      setPricing(null);
    }
  }, [pickup, dropoff, vehicleType, tab]);

  /* ── Fetch self-drive vehicles ─────────────────────────── */
  useEffect(() => {
    if (tab === 'self-drive') {
      setVehiclesLoading(true);
      setSelectedVehicle(null);
      // Use search endpoint — works even without pickup (fallback to India center)
      const params = {
        rentalType: 'self-drive',
        vehicleType: vehicleTypeFilter !== 'all' ? vehicleTypeFilter : undefined,
        maxDistance: 50000, // 50km radius
      };
      if (pickup) {
        params.lat = pickup.lat;
        params.lng = pickup.lng;
      } else {
        // Default to India center so we always get results
        params.lat = 20.5937;
        params.lng = 78.9629;
        params.maxDistance = 5000000; // 5000km — show all
      }
      vehiclesAPI.search(params)
        .then(res => setVehicles(res.data?.vehicles || []))
        .catch(err => {
          console.error('Vehicle search error:', err.response?.data || err.message);
          setVehicles([]);
        })
        .finally(() => setVehiclesLoading(false));
    }
  }, [tab, pickup, vehicleTypeFilter]);

  /* ── Self-drive pricing ─────────────────────────────────── */
  const selfDrivePricing = selectedVehicle ? (() => {
    const days = Math.max(1, rentalDays);
    const base = selectedVehicle.pricePerDay * days;
    const gst = Math.round(base * 0.18);
    const total = base + gst;
    // Segment label
    const segment =
      selectedVehicle.vehicleType === 'bike' ? 'Economy Bike' :
        selectedVehicle.vehicleType === 'scooter' ? 'Scooter' :
          selectedVehicle.pricePerDay < 1400 ? 'Hatchback' :
            selectedVehicle.pricePerDay < 1700 ? 'Compact SUV' :
              selectedVehicle.pricePerDay < 2000 ? 'Premium SUV' : 'Luxury';
    return { days, base, gst, total, segment };
  })() : null;

  /* ── Book Ride ─────────────────────────────────────────── */
  const handleBookRide = async () => {
    if (!pickup || !dropoff) { toast.error('Set pickup and dropoff locations'); return; }
    if (!pricing) { toast.error('Pricing not calculated yet'); return; }
    setIsBooking(true);
    try {
      const res = await bookingsAPI.create({
        pickupLocation: { address: pickup.address, coordinates: [pickup.lng, pickup.lat] },
        dropoffLocation: { address: dropoff.address, coordinates: [dropoff.lng, dropoff.lat] },
        vehicleType, rentalType: 'driver-operated',
        estimatedDistance: pricing.distance,
        estimatedDuration: pricing.duration,
        totalAmount: pricing.total,
      });
      toast.success('Booking created!');
      navigate(`/payment/${res.data.booking._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally { setIsBooking(false); }
  };

  /* ── Book Self-Drive ───────────────────────────────────── */
  const handleBookSelfDrive = async () => {
    if (!pickup) { toast.error('Set pickup location'); return; }
    if (!selectedVehicle) { toast.error('Select a vehicle'); return; }
    if (!selfDrivePricing) { toast.error('Pricing error'); return; }
    setIsBooking(true);
    try {
      const res = await bookingsAPI.create({
        vehicleId: selectedVehicle._id,
        pickupLocation: { address: pickup.address, coordinates: [pickup.lng, pickup.lat] },
        vehicleType: selectedVehicle.vehicleType,
        rentalType: 'self-drive',
        totalAmount: selfDrivePricing.total,
        specialRequests: `Self-drive rental for ${rentalDays} day(s)`,
      });
      toast.success('Self-drive booking created!');
      navigate(`/payment/${res.data.booking._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
      console.error('Self-drive booking error:', e.response?.data || e);
    } finally { setIsBooking(false); }
  };

  /* ── Book Parcel ───────────────────────────────────────── */
  const handleBookParcel = async () => {
    if (!pickup) { toast.error('Set pickup location'); return; }
    if (!dropoff) { toast.error('Set delivery address'); return; }
    if (!receiverName) { toast.error('Enter receiver name'); return; }
    if (!receiverPhone) { toast.error('Enter receiver phone'); return; }
    setIsBooking(true);
    try {
      const sizeConfig = PARCEL_SIZES.find(s => s.value === parcelSize) || PARCEL_SIZES[0];
      const res = await parcelsAPI.create({
        // Backend expects these exact field names:
        pickupLocation: {
          address: pickup.address,
          coordinates: [pickup.lng, pickup.lat],
        },
        dropoffLocation: {
          address: dropoff.address,
          coordinates: [dropoff.lng, dropoff.lat],
          contactName: receiverName,
          contactPhone: receiverPhone,
        },
        parcelDetails: {
          description: parcelDesc || 'No description',
          weight: sizeConfig.weight,
          fragile: parcelFragile,
        },
        vehicleTypeRequired: sizeConfig.vehicleType,
      });
      toast.success('Parcel delivery booked successfully!');
      // Parcels don't go through payment page — navigate to ride history
      navigate('/ride-history');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Parcel booking failed';
      toast.error(msg);
      console.error('Parcel booking error:', e.response?.data || e);
    } finally { setIsBooking(false); }
  };

  /* ── Route polyline ────────────────────────────────────── */
  const routeLine = pickup && dropoff
    ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]
    : null;

  /* ── Book button state ─────────────────────────────────── */
  const bookDisabled = isBooking || (
    tab === 'ride' ? (!pickup || !dropoff || !pricing) :
      tab === 'self-drive' ? (!pickup || !selectedVehicle) :
    /* parcel */           (!pickup || !dropoff || !receiverName || !receiverPhone)
  );

  const bookLabel = isBooking ? 'Processing...' : (
    tab === 'ride' ? (pricing ? `Proceed · ${formatCurrency(pricing.total)}` : 'Set Both Locations') :
      tab === 'self-drive' ? (
        selfDrivePricing
          ? `Book · ₹${selfDrivePricing.total.toLocaleString()} (${rentalDays}d incl. GST)`
          : selectedVehicle ? 'Set Rental Days' : 'Select a Vehicle'
      ) :
    /* parcel */           'Book Parcel Delivery'
  );

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* ── Header ── */}
      <div className="sticky top-16 z-20 border-b border-white/10"
        style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">Book a Service</h1>
            {clickMode && (
              <p className="text-xs text-primary mt-0.5 animate-pulse">
                📍 Click on the map to set {clickMode} location
              </p>
            )}
          </div>
          {/* Service Tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {SERVICE_TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setPricing(null); setSelectedVehicle(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-primary text-white shadow-neon-sm' : 'text-white/50 hover:text-white'
                  }`}>
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row gap-4">

        {/* ── LEFT PANEL ── */}
        <div className="lg:w-80 xl:w-96 shrink-0 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>

          {/* Location Card */}
          <div className="rounded-2xl p-4 space-y-3 border border-white/10"
            style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>

            {/* Pickup */}
            <LocationInput
              label="Pickup Location"
              icon={<MapPin size={15} />}
              iconColor="text-green-400"
              value={pickup}
              onSelect={(loc) => { setPickup(loc); if (loc) setFlyPos(loc); }}
              placeholder="Search pickup..."
            />
            <div className="flex gap-2">
              <button onClick={() => useCurrentLocation('pickup')}
                disabled={gpsLoading === 'pickup'}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-white/10 text-white/50 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50">
                {gpsLoading === 'pickup' ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                Use my location
              </button>
              <button onClick={() => setClickMode(clickMode === 'pickup' ? null : 'pickup')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${clickMode === 'pickup'
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'border-white/10 text-white/50 hover:text-green-400 hover:border-green-500/30'
                  }`}>
                <MapPin size={12} />
                {clickMode === 'pickup' ? 'Tap map...' : 'Tap map'}
              </button>
            </div>

            {/* Dropoff — hidden for self-drive (customer drives freely) */}
            {tab !== 'self-drive' && (
              <>
                <LocationInput
                  label={tab === 'parcel' ? 'Delivery Address' : 'Dropoff Location'}
                  icon={<Navigation size={15} />}
                  iconColor="text-primary"
                  value={dropoff}
                  onSelect={(loc) => { setDropoff(loc); if (loc) setFlyPos(loc); }}
                  placeholder={tab === 'parcel' ? 'Search delivery address...' : 'Search destination...'}
                />
                <div className="flex gap-2">
                  <button onClick={() => useCurrentLocation('dropoff')}
                    disabled={gpsLoading === 'dropoff'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-white/10 text-white/50 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50">
                    {gpsLoading === 'dropoff' ? <Loader2 size={12} className="animate-spin" /> : <Crosshair size={12} />}
                    Use my location
                  </button>
                  <button onClick={() => setClickMode(clickMode === 'dropoff' ? null : 'dropoff')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-all ${clickMode === 'dropoff'
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'border-white/10 text-white/50 hover:text-primary hover:border-primary/30'
                      }`}>
                    <MapPin size={12} />
                    {clickMode === 'dropoff' ? 'Tap map...' : 'Tap map'}
                  </button>
                </div>
              </>
            )}

            {/* Self-drive info banner */}
            {tab === 'self-drive' && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-primary/20"
                style={{ background: 'rgba(249,116,21,0.06)' }}>
                <span className="text-base mt-0.5">🚗</span>
                <p className="text-white/50 text-[11px] leading-relaxed">
                  The vehicle will be <span className="text-primary font-semibold">delivered to your location</span>. Drive freely — no dropoff needed. Return it when your rental period ends.
                </p>
              </div>
            )}
          </div>

          {/* ── RIDE TAB ── */}
          {tab === 'ride' && (
            <>
              {/* Vehicle type */}
              <div className="rounded-2xl p-4 border border-white/10"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Vehicle Type</p>
                <div className="grid grid-cols-3 gap-2">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v.value} onClick={() => setVehicleType(v.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${vehicleType === v.value
                        ? 'bg-primary/20 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}>
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-xs font-bold">{v.label}</span>
                      <span className="text-[10px] opacity-60">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <AnimatePresence>
                {isCalc && (
                  <div className="rounded-2xl p-4 border border-white/10 flex items-center gap-3"
                    style={{ background: 'rgba(17,24,39,0.8)' }}>
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-white/50 text-sm">Calculating fare...</span>
                  </div>
                )}
                {pricing && !isCalc && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 border border-primary/20"
                    style={{ background: 'rgba(249,116,21,0.06)', backdropFilter: 'blur(20px)' }}>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <IndianRupee size={11} className="text-primary" /> Fare Breakdown
                    </p>
                    <div className="space-y-1.5 text-xs">
                      {[
                        ['Base Fare', pricing.breakdown?.baseFare],
                        [`Distance (${pricing.distance?.toFixed(1)} km)`, pricing.breakdown?.distanceFare],
                        [`Time (~${Math.round(pricing.duration)} min)`, pricing.breakdown?.timeFare],
                        ['Platform Fee', pricing.breakdown?.platformFee],
                        ['GST (18%)', pricing.breakdown?.gst],
                      ].filter(([, v]) => v > 0).map(([label, val]) => (
                        <div key={label} className="flex justify-between text-white/50">
                          <span>{label}</span><span>{formatCurrency(val)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(pricing.total)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30 text-[10px] mt-2">
                      <Clock size={10} /> ~{Math.round(pricing.duration)} min estimated
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* ── SELF-DRIVE TAB ── */}
          {tab === 'self-drive' && (
            <>
              {/* Vehicle type filter + rental days */}
              <div className="rounded-2xl p-4 border border-white/10"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Vehicle Type</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[{ value: 'all', label: 'All', icon: '🚘' }, ...VEHICLE_TYPES].map(v => (
                    <button key={v.value} onClick={() => setVehicleTypeFilter(v.value)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${vehicleTypeFilter === v.value
                        ? 'bg-primary/20 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}>
                      <span className="text-lg">{v.icon}</span>
                      <span className="text-[10px] font-bold">{v.label}</span>
                    </button>
                  ))}
                </div>

                {/* Rental days */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Rental Duration</p>
                    <span className="text-xs font-bold text-primary">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRentalDays(d => Math.max(1, d - 1))}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-lg font-bold flex items-center justify-center">
                      −
                    </button>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-center">
                      <span className="text-white font-bold text-sm">{rentalDays}</span>
                      <span className="text-white/40 text-xs ml-1">day{rentalDays > 1 ? 's' : ''}</span>
                    </div>
                    <button onClick={() => setRentalDays(d => Math.min(30, d + 1))}
                      className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-lg font-bold flex items-center justify-center">
                      +
                    </button>
                  </div>
                  {/* Quick day presets */}
                  <div className="flex gap-1.5 mt-2">
                    {[1, 3, 7, 15, 30].map(d => (
                      <button key={d} onClick={() => setRentalDays(d)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${rentalDays === d
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                          }`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vehicle list */}
              <div className="rounded-2xl p-4 border border-white/10"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
                  Available Vehicles{vehicles.length ? ` (${vehicles.length})` : ''}
                </p>

                {vehiclesLoading && (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-white/40 text-xs">Loading vehicles...</span>
                  </div>
                )}

                {!vehiclesLoading && vehicles.length === 0 && (
                  <p className="text-white/30 text-xs text-center py-4">No vehicles available for this type</p>
                )}

                {!vehiclesLoading && vehicles.length > 0 && (
                  <div className="space-y-2">
                    {vehicles.slice(0, 8).map(v => {
                      const seg =
                        v.vehicleType === 'bike' ? 'Economy Bike' :
                          v.vehicleType === 'scooter' ? 'Scooter' :
                            v.pricePerDay < 1400 ? 'Hatchback' :
                              v.pricePerDay < 1700 ? 'Compact SUV' :
                                v.pricePerDay < 2000 ? 'Premium SUV' : 'Luxury';
                      const typeIcon =
                        v.vehicleType === 'bike' ? '🏍️' :
                          v.vehicleType === 'scooter' ? '🛵' : '🚗';
                      return (
                        <button key={v._id} onClick={() => setSelectedVehicle(v)}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${selectedVehicle?._id === v._id
                            ? 'bg-primary/15 border-primary/40'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                            }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-2">
                              <span className="text-lg mt-0.5">{typeIcon}</span>
                              <div>
                                <p className="text-white text-xs font-semibold">{v.brand} {v.model}</p>
                                <p className="text-white/40 text-[10px] mt-0.5">
                                  {v.year} · {v.seatCapacity} seats · ⭐{v.rating?.toFixed(1) || '4.5'}
                                </p>
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-white/5 text-white/40 border border-white/10">
                                  {seg}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-primary text-xs font-bold">₹{v.pricePerDay}/day</p>
                              <p className="text-white/30 text-[10px]">₹{v.pricePerHour}/hr</p>
                              <p className="text-white/50 text-[10px] font-semibold mt-1">
                                Total: ₹{Math.round(v.pricePerDay * rentalDays * 1.18).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {selectedVehicle?._id === v._id && (
                            <div className="flex items-center gap-1 mt-2 text-primary text-[10px]">
                              <CheckCircle2 size={11} /> Selected · {rentalDays} day{rentalDays > 1 ? 's' : ''}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              {selfDrivePricing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4 border border-primary/20"
                  style={{ background: 'rgba(249,116,21,0.06)', backdropFilter: 'blur(20px)' }}>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <IndianRupee size={11} className="text-primary" /> Rental Cost · {selfDrivePricing.segment}
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/50">
                      <span>₹{selectedVehicle.pricePerDay}/day × {selfDrivePricing.days} day{selfDrivePricing.days > 1 ? 's' : ''}</span>
                      <span>₹{selfDrivePricing.base.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>GST (18%)</span>
                      <span>₹{selfDrivePricing.gst.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-primary">₹{selfDrivePricing.total.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* ── PARCEL TAB ── */}
          {tab === 'parcel' && (
            <>
              {/* Parcel size */}
              <div className="rounded-2xl p-4 border border-white/10"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Parcel Size</p>
                <div className="grid grid-cols-3 gap-2">
                  {PARCEL_SIZES.map(s => (
                    <button key={s.value} onClick={() => setParcelSize(s.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${parcelSize === s.value
                        ? 'bg-primary/20 border-primary/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}>
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-xs font-bold">{s.label}</span>
                      <span className="text-[10px] opacity-60">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Receiver details */}
              <div className="rounded-2xl p-4 border border-white/10 space-y-3"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Receiver Details</p>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1">Name *</label>
                  <input value={receiverName} onChange={e => setReceiverName(e.target.value)}
                    placeholder="Receiver's full name"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1">Phone *</label>
                  <input value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX" type="tel"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all" />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1">Description (optional)</label>
                  <textarea value={parcelDesc} onChange={e => setParcelDesc(e.target.value)}
                    placeholder="What's in the parcel?" rows={2}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all resize-none" />
                </div>

                {/* Fragile toggle */}
                <button onClick={() => setParcelFragile(f => !f)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${parcelFragile
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                    }`}>
                  <span className="text-xs font-medium flex items-center gap-2">
                    <span>⚠️</span> Fragile / Handle with care
                  </span>
                  <span className={`w-8 h-4 rounded-full transition-all relative ${parcelFragile ? 'bg-yellow-500' : 'bg-white/10'}`}>
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${parcelFragile ? 'left-4' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>
            </>
          )}

          {/* ── Book Button ── */}
          <button
            onClick={tab === 'ride' ? handleBookRide : tab === 'self-drive' ? handleBookSelfDrive : handleBookParcel}
            disabled={bookDisabled}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all shadow-neon-sm hover:shadow-neon active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-sm flex items-center justify-center gap-2">
            {isBooking
              ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
              : <>{bookLabel} {!bookDisabled && <ChevronRight size={16} />}</>
            }
          </button>
        </div>

        {/* ── MAP ── */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative" style={{ minHeight: '520px' }}>
          {/* Click mode banner */}
          {clickMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white pointer-events-none"
              style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(249,116,21,0.4)' }}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${clickMode === 'pickup' ? 'bg-green-400' : 'bg-primary'}`} />
              Click anywhere to set {clickMode}
            </div>
          )}

          <MapContainer center={INDIA_CENTER} zoom={5} style={{ width: '100%', height: '100%' }}>
            <TileLayer url={DARK_TILE} attribution={DARK_ATTR} />
            <MapClickHandler onSelect={handleMapClick} active={!!clickMode} />
            {flyPos && <FlyTo pos={flyPos} />}

            {pickup && (
              <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                <Popup><b>📍 Pickup</b><br /><span style={{ fontSize: 11 }}>{pickup.address}</span></Popup>
              </Marker>
            )}
            {dropoff && (
              <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
                <Popup><b>🏁 {tab === 'parcel' ? 'Delivery' : 'Dropoff'}</b><br /><span style={{ fontSize: 11 }}>{dropoff.address}</span></Popup>
              </Marker>
            )}
            {routeLine && (
              <Polyline positions={routeLine} color="#f97415" weight={3} opacity={0.8} dashArray="10 6" />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
