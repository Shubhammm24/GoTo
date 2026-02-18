import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, IndianRupee, Clock, Phone, CheckCircle, XCircle,
  Car, MapPin, Star, Zap, Bell, RefreshCw, Navigation, Loader2,
  AlertCircle, BarChart2, History, ChevronRight, Bike, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/index';
import { driversAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Ride Request Popup with countdown timer ─────────────────── */
function RideRequestPopup({ ride, onAccept, onDecline, accepting }) {
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          onDecline(ride._id, 'Timed out');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [ride._id]);

  const pct = (timeLeft / 20) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
    >
      <div className="rounded-2xl overflow-hidden border border-primary/50 shadow-[0_0_30px_rgba(249,116,21,0.25)]"
        style={{ background: 'rgba(17,24,39,0.97)', backdropFilter: 'blur(24px)' }}>
        {/* Timer bar */}
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-primary origin-left"
            initial={{ scaleX: 1 }}
            animate={{ scaleX: pct / 100 }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-primary/20 mb-1">
                🔔 New Ride Request
              </span>
              <h3 className="text-white text-xl font-bold">
                ₹{ride.estimatedEarnings?.toLocaleString() || ride.totalAmount?.toLocaleString() || '—'}
                <span className="text-white/30 text-sm font-normal ml-1">estimated</span>
              </h3>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white font-bold text-sm">
              {timeLeft}s
            </div>
          </div>

          {/* Passenger */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary font-bold flex items-center justify-center text-sm">
              {ride.customerId?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{ride.customerId?.name || 'Passenger'}</p>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white/40 text-xs">{ride.customerId?.rating || '4.5'}</span>
              </div>
            </div>
            {ride.distToPickup != null && (
              <div className="ml-auto text-right">
                <p className="text-white/40 text-[10px]">Pickup dist.</p>
                <p className="text-white text-sm font-bold">{ride.distToPickup} km</p>
              </div>
            )}
          </div>

          {/* Route */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="w-px h-7 border-l border-dashed border-white/20" />
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-white/40 text-[10px] uppercase">Pickup</p>
                <p className="text-white text-xs font-medium leading-tight">
                  {ride.pickupLocation?.address || 'Pickup location'}
                </p>
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase">Dropoff</p>
                <p className="text-white text-xs font-medium leading-tight">
                  {ride.dropoffLocation?.address || 'Dropoff location'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-white/40 text-[10px]">Trip dist.</p>
              <p className="text-white text-sm font-bold">{ride.estimatedDistance || '—'} km</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onDecline(ride._id, 'Driver declined')}
              disabled={accepting}
              className="flex-1 py-3 rounded-xl border border-white/20 text-white/70 font-bold text-sm hover:bg-white/5 transition-all disabled:opacity-40">
              Decline
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAccept(ride._id)}
              disabled={accepting}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {accepting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Accept
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Earnings Bar Chart ──────────────────────────────────────── */
function EarningsChart({ rides }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0=Sun
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // JS day → Mon-indexed

  const earningsByDay = Array(7).fill(0);
  rides.forEach(r => {
    const d = new Date(r.createdAt);
    const idx = dayMap[d.getDay()];
    earningsByDay[idx] += r.totalAmount || 0;
  });

  const max = Math.max(...earningsByDay, 1);
  const todayIdx = dayMap[today];

  return (
    <div className="relative h-40 flex items-end justify-between gap-1.5 px-1">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="w-full h-px bg-white/5" />
        ))}
      </div>
      {days.map((day, i) => {
        const h = Math.round((earningsByDay[i] / max) * 100);
        const isToday = i === todayIdx;
        return (
          <div key={day} className="flex flex-col items-center flex-1 h-full justify-end gap-1 group cursor-pointer">
            <div
              className={`w-full rounded-t-lg transition-all group-hover:opacity-90 ${isToday ? 'bg-primary shadow-[0_0_8px_rgba(249,116,21,0.4)]' : 'bg-white/10 group-hover:bg-white/20'}`}
              style={{ height: `${Math.max(h, 4)}%` }}
            />
            <span className={`text-[10px] font-semibold ${isToday ? 'text-primary' : 'text-white/30'}`}>{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Driver Registration Wizard ──────────────────────────────── */
function DriverRegistrationWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    licenseNumber: '', licenseExpiry: '', yearsOfExperience: '',
    vehicleType: 'car', brand: '', model: '', plate: '', color: '', year: '',
    accountNumber: '', ifsc: '', accountName: ''
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        licenseNumber: form.licenseNumber,
        licenseExpiry: form.licenseExpiry,
        yearsOfExperience: Number(form.yearsOfExperience),
        vehicleDetails: {
          vehicleType: form.vehicleType,
          brand: form.brand,
          model: form.model,
          licensePlate: form.plate,
          color: form.color,
          year: Number(form.year)
        },
        bankDetails: {
          accountNumber: form.accountNumber,
          ifsc: form.ifsc,
          accountName: form.accountName
        }
      };
      await driversAPI.register(payload);
      toast.success('Registration submitted! Awaiting admin approval.');
      onComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-all";
  const lbl = "text-white/40 text-xs font-bold uppercase tracking-wider mb-1.5 block";

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(20px)' }}>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/5 flex">
          <div className={`h-full bg-primary transition-all duration-500`} style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2">Setup Driver Profile</h1>
            <p className="text-white/40">Step {step} of 3 • {step === 1 ? 'License Info' : step === 2 ? 'Vehicle Details' : 'Bank Details'}</p>
          </div>

          <div className="space-y-6">
            {/* STEP 1: LICENSE */}
            {step === 1 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                <div><label className={lbl}>License Number</label>
                  <input className={inp} value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="DL-1234567890123" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Expiry Date</label>
                    <input type="date" className={inp} value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} /></div>
                  <div><label className={lbl}>Experience (Years)</label>
                    <input type="number" className={inp} value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: e.target.value })} placeholder="e.g. 5" /></div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: VEHICLE */}
            {step === 2 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                <div><label className={lbl}>Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['car', 'bike', 'scooter'].map(t => (
                      <button key={t} onClick={() => setForm({ ...form, vehicleType: t })}
                        className={`py-3 rounded-xl font-bold capitalize transition-all ${form.vehicleType === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={lbl}>Brand</label>
                    <input className={inp} value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Toyota" /></div>
                  <div><label className={lbl}>Model</label>
                    <input className={inp} value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="Innova" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1"><label className={lbl}>Year</label>
                    <input type="number" className={inp} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2020" /></div>
                  <div className="col-span-2"><label className={lbl}>License Plate</label>
                    <input className={inp} value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} placeholder="MH01AB1234" /></div>
                </div>
                <div><label className={lbl}>Color</label>
                  <input className={inp} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="White" /></div>
              </motion.div>
            )}

            {/* STEP 3: BANK */}
            {step === 3 && (
              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                <div><label className={lbl}>Account Number</label>
                  <input className={inp} value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="XXXXXXXXXXXX" /></div>
                <div><label className={lbl}>IFSC Code</label>
                  <input className={inp} value={form.ifsc} onChange={e => setForm({ ...form, ifsc: e.target.value })} placeholder="SBIN0001234" /></div>
                <div><label className={lbl}>Account Holder Name</label>
                  <input className={inp} value={form.accountName} onChange={e => setForm({ ...form, accountName: e.target.value })} placeholder="As per bank records" /></div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              {step > 1 && (
                <button onClick={back} className="px-6 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all">Back</button>
              )}
              <button
                onClick={step === 3 ? handleSubmit : next}
                disabled={loading}
                className="flex-1 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-orange-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {step === 3 ? (loading ? 'Submitting...' : 'Submit Registration') : 'Next Step →'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Main DriverDashboard ────────────────────────────────────── */
export default function DriverDashboard() {

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [driverProfile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [rideHistory, setHistory] = useState([]);
  const [pendingRides, setPending] = useState([]);
  const [assignedRides, setAssigned] = useState([]);
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [activeRequest, setActive] = useState(null); // the popup ride
  const pollRef = useRef(null);

  /* ── Load initial data ─────────────────────────────────────── */
  const loadData = useCallback(async () => {
    try {
      const [profRes, earnRes, histRes, assignRes] = await Promise.allSettled([
        driversAPI.getProfile(),
        driversAPI.getEarnings(),
        driversAPI.getRideHistory({ limit: 20 }),
        driversAPI.getAssignedRides(),
      ]);

      if (profRes.status === 'fulfilled') {
        const d = profRes.value.data?.driver;
        setProfile(d);
        setIsOnDuty(d?.isOnDuty || false);
      }
      if (earnRes.status === 'fulfilled') setEarnings(earnRes.value.data);
      if (histRes.status === 'fulfilled') setHistory(histRes.value.data?.rides || []);
      if (assignRes.status === 'fulfilled') setAssigned(assignRes.value.data?.rides || []);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Poll for pending rides when on duty ───────────────────── */
  const pollPending = useCallback(async () => {
    try {
      const res = await driversAPI.getPendingRides();
      const rides = res.data?.rides || [];
      setPending(rides);

      // Show popup for the first new request
      if (rides.length > 0 && !activeRequest) {
        const first = rides[0];
        setActive(first);
        // Play a notification sound if browser allows
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...').play(); } catch { }
      }
    } catch { }
  }, [activeRequest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isOnDuty) {
      pollPending();
      pollRef.current = setInterval(pollPending, 8000); // poll every 8s
    } else {
      clearInterval(pollRef.current);
      setPending([]);
      setActive(null);
    }
    return () => clearInterval(pollRef.current);
  }, [isOnDuty, pollPending]);

  /* ── Share location when going on duty ─────────────────────── */
  const shareLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      driversAPI.updateLocation([pos.coords.longitude, pos.coords.latitude]).catch(() => { });
    });
  };

  /* ── Toggle duty ───────────────────────────────────────────── */
  const handleToggleDuty = async () => {
    setToggling(true);
    try {
      const newDuty = !isOnDuty;
      let coords = null;
      if (newDuty && navigator.geolocation) {
        coords = await new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            p => resolve([p.coords.longitude, p.coords.latitude]),
            () => resolve(null),
            { timeout: 4000 }
          );
        });
      }
      await driversAPI.toggleAvailability({
        isOnDuty: newDuty,
        ...(coords ? { currentLocation: { coordinates: coords } } : {})
      });
      setIsOnDuty(newDuty);
      toast.success(newDuty ? '🟢 You are now On Duty!' : '🔴 You are now Off Duty');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to toggle duty status');
    } finally {
      setToggling(false);
    }
  };

  /* ── Accept ride ───────────────────────────────────────────── */
  const handleAccept = async (rideId) => {
    setAccepting(true);
    try {
      await driversAPI.acceptRide(rideId);
      toast.success('🎉 Ride accepted! Head to pickup location.');
      setActive(null);
      setPending(p => p.filter(r => r._id !== rideId));
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to accept ride');
    } finally {
      setAccepting(false);
    }
  };

  /* ── Decline ride ──────────────────────────────────────────── */
  const handleDecline = async (rideId, reason) => {
    try {
      await driversAPI.rejectRide(rideId, reason);
    } catch { }
    setActive(null);
    setPending(p => p.filter(r => r._id !== rideId));
  };

  /* ── Start ride ────────────────────────────────────────────── */
  const handleStartRide = async (rideId) => {
    try {
      await driversAPI.startRide(rideId);
      toast.success('Ride started!');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start ride');
    }
  };

  /* ── Derived stats ─────────────────────────────────────────── */
  const totalEarnings = earnings?.earnings?.totalEarnings || 0;
  const availBalance = earnings?.earnings?.availableBalance || 0;
  const completedRides = driverProfile?.completedRides || 0;
  const driverRating = driverProfile?.rating || 0;

  // Today's earnings from ride history
  const today = new Date().toDateString();
  const todayRides = rideHistory.filter(r => new Date(r.createdAt).toDateString() === today);
  const todayEarnings = todayRides.reduce((s, r) => s + (r.totalAmount || 0), 0);

  // This week
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekRides = rideHistory.filter(r => new Date(r.createdAt) >= weekStart);
  const weekEarnings = weekRides.reduce((s, r) => s + (r.totalAmount || 0), 0);

  const vehicle = driverProfile?.vehicleDetails;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    );
  }

  // If no driver profile exists, show registration wizard
  if (!driverProfile) {
    return <DriverRegistrationWizard onComplete={loadData} />;
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-20 border-b border-white/10"
        style={{ background: 'rgba(10,15,30,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary font-black text-base">
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-dark ${isOnDuty ? 'bg-green-400' : 'bg-white/20'}`} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">{user?.name || 'Driver'}</p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={9} className={i < Math.round(driverRating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
                ))}
                <span className="text-white/30 text-[10px] ml-0.5">{driverRating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            {pendingRides.length > 0 && (
              <div className="relative">
                <Bell size={18} className="text-primary animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingRides.length}
                </span>
              </div>
            )}

            {/* Duty toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleToggleDuty}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${isOnDuty
                ? 'bg-green-500/15 border border-green-500/30 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
                : 'bg-white/5 border border-white/10 text-white/50'
                }`}>
              {toggling
                ? <Loader2 size={12} className="animate-spin" />
                : <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
              }
              {isOnDuty ? 'On Duty' : 'Go Online'}
            </motion.button>

            <button onClick={loadData} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'rides', label: 'Active Rides', icon: Car },
            { id: 'history', label: 'History', icon: History },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-primary text-white' : 'text-white/40 hover:text-white'
                }`}>
              <t.icon size={12} />
              {t.label}
              {t.id === 'rides' && assignedRides.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tab === t.id ? 'bg-white/20' : 'bg-white/10'}`}>
                  {assignedRides.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* ── Not approved warning ─────────────────────────────── */}
        {driverProfile && !driverProfile.isActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
            <AlertCircle size={16} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-yellow-400 text-sm font-semibold">Account Pending Approval</p>
              <p className="text-white/40 text-xs">Your driver account is awaiting admin approval. You cannot go on duty yet.</p>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Today's Earnings", value: `₹${todayEarnings.toLocaleString()}`, icon: IndianRupee, color: 'text-primary', bg: 'bg-primary/10', bar: todayEarnings > 0 ? Math.min((todayEarnings / 2000) * 100, 100) : 0 },
                { label: "Week's Earnings", value: `₹${weekEarnings.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', bar: weekEarnings > 0 ? Math.min((weekEarnings / 10000) * 100, 100) : 0 },
                { label: "Total Earnings", value: `₹${totalEarnings.toLocaleString()}`, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', bar: 85 },
                { label: "Trips Completed", value: completedRides, icon: Car, color: 'text-green-400', bg: 'bg-green-500/10', bar: Math.min((completedRides / 200) * 100, 100) },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-4 border border-white/10"
                  style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                  <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon size={16} />
                  </div>
                  <p className="text-white font-black text-xl mb-0.5">{s.value}</p>
                  <p className="text-white/40 text-[10px] mb-2">{s.label}</p>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color.replace('text-', 'bg-')}`} style={{ width: `${s.bar}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Earnings chart + Vehicle info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Chart */}
              <div className="md:col-span-2 rounded-2xl p-5 border border-white/10"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm">Weekly Earnings</h3>
                  <span className="text-white/30 text-xs">₹{weekEarnings.toLocaleString()} this week</span>
                </div>
                <EarningsChart rides={rideHistory} />
              </div>

              {/* Vehicle card */}
              <div className="rounded-2xl p-5 border border-white/10"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Car size={14} className="text-primary" />
                  <h3 className="text-white font-bold text-sm">Your Vehicle</h3>
                </div>
                {vehicle ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                      <p className="text-white font-bold text-sm">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-white/40 text-xs">{vehicle.licensePlate}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white/5">
                        <p className="text-white/40 text-[10px]">Type</p>
                        <p className="text-white text-xs font-bold capitalize">{vehicle.vehicleType}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <p className="text-white/40 text-[10px]">Color</p>
                        <p className="text-white text-xs font-bold">{vehicle.color || '—'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Car size={28} className="text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-xs">No vehicle registered</p>
                    <button onClick={() => navigate('/driver/register')}
                      className="mt-3 text-primary text-xs hover:underline">Register vehicle →</button>
                  </div>
                )}

                {/* Balance */}
                <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                  <p className="text-white/40 text-[10px] mb-1">Available Balance</p>
                  <p className="text-green-400 font-black text-lg">₹{availBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Pending ride requests (when on duty) */}
            {isOnDuty && pendingRides.length > 0 && (
              <div className="rounded-2xl p-5 border border-primary/20"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={14} className="text-primary animate-pulse" />
                  <h3 className="text-white font-bold text-sm">Nearby Ride Requests</h3>
                  <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingRides.length}</span>
                </div>
                <div className="space-y-3">
                  {pendingRides.map(ride => (
                    <div key={ride._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="text-white text-sm font-semibold">{ride.customerId?.name || 'Passenger'}</p>
                        <p className="text-white/40 text-xs">{ride.pickupLocation?.address?.slice(0, 40) || 'Pickup'}</p>
                        {ride.distToPickup != null && (
                          <p className="text-white/30 text-[10px]">{ride.distToPickup} km away</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-primary font-black text-base">₹{ride.estimatedEarnings || ride.totalAmount || '—'}</p>
                        <button onClick={() => setActive(ride)}
                          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-orange-500 transition-all">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Off duty state */}
            {!isOnDuty && (
              <div className="rounded-2xl p-8 border border-white/10 text-center"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <div className="text-4xl mb-3">🚗</div>
                <p className="text-white font-bold mb-1">You're currently off duty</p>
                <p className="text-white/40 text-sm mb-4">Go online to start receiving ride requests from nearby customers</p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleToggleDuty}
                  disabled={toggling || (driverProfile && !driverProfile.isActive)}
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-neon hover:bg-orange-500 transition-all disabled:opacity-50">
                  {toggling ? 'Going Online...' : 'Go Online Now'}
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* ACTIVE RIDES TAB */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === 'rides' && (
          <div className="space-y-4">
            {assignedRides.length === 0 ? (
              <div className="rounded-2xl p-10 border border-white/10 text-center"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <Car size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white font-bold">No active rides</p>
                <p className="text-white/40 text-sm mt-1">
                  {isOnDuty ? 'Waiting for ride requests...' : 'Go online to receive rides'}
                </p>
              </div>
            ) : (
              assignedRides.map((ride, i) => (
                <motion.div key={ride._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl p-5 border border-white/10"
                  style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${ride.status === 'in_progress'
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      }`}>
                      {ride.status === 'in_progress' ? '🚗 In Progress' : '✅ Driver Assigned'}
                    </span>
                    <p className="text-primary font-black text-lg">₹{ride.totalAmount?.toLocaleString() || '—'}</p>
                  </div>

                  {/* Passenger */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
                    <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary font-bold flex items-center justify-center">
                      {ride.customerId?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold">{ride.customerId?.name || 'Passenger'}</p>
                      <p className="text-white/40 text-xs">{ride.customerId?.phone || 'No phone'}</p>
                    </div>
                    <a href={`tel:${ride.customerId?.phone}`}
                      className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                      <Phone size={14} />
                    </a>
                  </div>

                  {/* Route */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <div className="w-px h-8 bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase">Pickup</p>
                        <p className="text-white text-xs font-medium">{ride.pickupLocation?.address || '—'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase">Dropoff</p>
                        <p className="text-white text-xs font-medium">{ride.dropoffLocation?.address || '—'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[10px]">Distance</p>
                      <p className="text-white text-sm font-bold">{ride.estimatedDistance || '—'} km</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {ride.status === 'driver_assigned' && (
                      <motion.button whileTap={{ scale: 0.97 }}
                        onClick={() => handleStartRide(ride._id)}
                        className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-500 transition-all">
                        <Navigation size={14} /> Start Ride
                      </motion.button>
                    )}
                    {ride.status === 'in_progress' && (
                      <button onClick={() => navigate(`/tracking/${ride._id}`)}
                        className="flex-1 py-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-all">
                        <MapPin size={14} /> View on Map
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* HISTORY TAB */}
        {/* ══════════════════════════════════════════════════════ */}
        {tab === 'history' && (
          <div className="space-y-3">
            {rideHistory.length === 0 ? (
              <div className="rounded-2xl p-10 border border-white/10 text-center"
                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                <History size={32} className="text-white/10 mx-auto mb-3" />
                <p className="text-white font-bold">No ride history yet</p>
                <p className="text-white/40 text-sm mt-1">Your completed rides will appear here</p>
              </div>
            ) : (
              rideHistory.map((ride, i) => (
                <motion.div key={ride._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
                  style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{ride.customerId?.name || 'Passenger'}</p>
                      <p className="text-white/40 text-xs">
                        {ride.pickupLocation?.address?.slice(0, 25) || '—'} → {ride.dropoffLocation?.address?.slice(0, 20) || '—'}
                      </p>
                      <p className="text-white/20 text-[10px]">
                        {new Date(ride.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">₹{ride.totalAmount?.toLocaleString() || '—'}</p>
                    <span className={`text-[10px] font-bold ${ride.status === 'completed' ? 'text-green-400' :
                      ride.status === 'cancelled' ? 'text-red-400' : 'text-white/40'
                      }`}>{ride.status}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Floating Ride Request Popup ─────────────────────────── */}
      <AnimatePresence>
        {activeRequest && (
          <RideRequestPopup
            key={activeRequest._id}
            ride={activeRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            accepting={accepting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
