import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Car, Users, BookOpen, MapPin, AlertTriangle,
  CheckCircle, XCircle, Plus, Trash2, RefreshCw, Loader2,
  Shield, TrendingUp, IndianRupee, Clock, Bike, Navigation,
  ChevronRight, Eye, Phone, Star, X, Edit2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const driverIcon = new L.DivIcon({
  html: `<div style="background:#f97415;border:2px solid white;border-radius:50%;width:14px;height:14px;box-shadow:0 0 8px rgba(249,116,21,0.8)"></div>`,
  className: '', iconSize: [14, 14], iconAnchor: [7, 7],
});

/* ─── Stat Card ─────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg, sub }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 border border-white/10"
      style={{ background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-3`}>
        <Icon size={18} />
      </div>
      <p className="text-white font-black text-2xl mb-0.5">{value ?? '—'}</p>
      <p className="text-white/40 text-xs">{label}</p>
      {sub && <p className="text-white/25 text-[10px] mt-1">{sub}</p>}
    </motion.div>
  );
}

/* ─── Add Vehicle Modal ─────────────────────────────────────── */
function AddVehicleModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    vehicleType: 'car', brand: '', model: '', licensePlate: '',
    year: new Date().getFullYear(), seatCapacity: 4,
    rentalType: 'self-drive', pricePerHour: '', pricePerDay: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.addVehicle(form);
      toast.success('Vehicle added!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    } finally { setSaving(false); }
  };

  const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary/50";
  const lbl = "text-white/50 text-xs mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 p-6"
        style={{ background: 'rgba(17,24,39,0.98)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Add Fleet Vehicle</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div><label className={lbl}>Type</label>
            <select className={inp} value={form.vehicleType} onChange={e => setForm(f => ({ ...f, vehicleType: e.target.value }))}>
              <option value="car">Car</option><option value="bike">Bike</option><option value="scooter">Scooter</option>
            </select></div>
          <div><label className={lbl}>Rental Type</label>
            <select className={inp} value={form.rentalType} onChange={e => setForm(f => ({ ...f, rentalType: e.target.value }))}>
              <option value="self-drive">Self Drive</option><option value="driver-operated">Driver Operated</option><option value="both">Both</option>
            </select></div>
          <div><label className={lbl}>Brand</label>
            <input className={inp} required value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="e.g. Honda" /></div>
          <div><label className={lbl}>Model</label>
            <input className={inp} required value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. City" /></div>
          <div><label className={lbl}>License Plate</label>
            <input className={inp} required value={form.licensePlate} onChange={e => setForm(f => ({ ...f, licensePlate: e.target.value }))} placeholder="MH01AB1234" /></div>
          <div><label className={lbl}>Year</label>
            <input className={inp} type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))} /></div>
          <div><label className={lbl}>Seats</label>
            <input className={inp} type="number" value={form.seatCapacity} onChange={e => setForm(f => ({ ...f, seatCapacity: +e.target.value }))} /></div>
          <div><label className={lbl}>Price/Hour (₹)</label>
            <input className={inp} type="number" value={form.pricePerHour} onChange={e => setForm(f => ({ ...f, pricePerHour: +e.target.value }))} /></div>
          <div className="col-span-2"><label className={lbl}>Price/Day (₹)</label>
            <input className={inp} type="number" value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: +e.target.value }))} /></div>
          <div className="col-span-2 flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-bold hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-orange-500 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Vehicle
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ─── Main AdminDashboard ───────────────────────────────────── */
export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const pollRef = useRef(null);

  const setAction = (id, val) => setActionLoading(p => ({ ...p, [id]: val }));

  /* ── Load all data ─────────────────────────────────────────── */
  const loadAll = useCallback(async () => {
    try {
      const [statsRes, pdRes, pvRes, sosRes] = await Promise.allSettled([
        adminAPI.getDashboard(),
        adminAPI.getPendingDrivers(),
        adminAPI.getPendingVehicles(),
        adminAPI.getSosAlerts(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.stats);
      if (pdRes.status === 'fulfilled') setPendingDrivers(pdRes.value.data?.drivers || []);
      if (pvRes.status === 'fulfilled') setPendingVehicles(pvRes.value.data?.vehicles || []);
      if (sosRes.status === 'fulfilled') setSosAlerts(sosRes.value.data?.alerts || []);
    } catch { }
    finally { setLoading(false); }
  }, []);

  const loadTabData = useCallback(async (t) => {
    if (t === 'fleet') {
      try { const r = await adminAPI.getAllVehicles(); setAllVehicles(r.data?.vehicles || []); } catch { }
    } else if (t === 'users') {
      try { const r = await adminAPI.getAllUsers(); setAllUsers(r.data?.users || []); } catch { }
    } else if (t === 'bookings') {
      try { const r = await adminAPI.getAllBookings({ limit: 50 }); setAllBookings(r.data?.bookings || []); } catch { }
    } else if (t === 'map') {
      try { const r = await adminAPI.getLiveLocations(); setLiveLocations(r.data?.locations || []); } catch { }
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { loadTabData(tab); }, [tab, loadTabData]);

  // Poll live locations every 15s when on map tab
  useEffect(() => {
    if (tab === 'map') {
      pollRef.current = setInterval(() => loadTabData('map'), 15000);
    } else clearInterval(pollRef.current);
    return () => clearInterval(pollRef.current);
  }, [tab, loadTabData]);

  /* ── Driver actions ────────────────────────────────────────── */
  const approveDriver = async (id) => {
    setAction(id, 'approve');
    try {
      await adminAPI.approveDriver(id);
      toast.success('Driver approved!');
      setPendingDrivers(p => p.filter(d => d._id !== id));
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setAction(id, null); }
  };

  const rejectDriver = async (id) => {
    setAction(id, 'reject');
    try {
      await adminAPI.rejectDriver(id, 'Rejected by admin');
      toast.success('Driver rejected');
      setPendingDrivers(p => p.filter(d => d._id !== id));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setAction(id, null); }
  };

  /* ── Vehicle approval actions ──────────────────────────────── */
  const approveVehicle = async (id) => {
    setAction(id, 'approve');
    try {
      await adminAPI.approveVehicle(id);
      toast.success('Vehicle approved!');
      setPendingVehicles(p => p.filter(v => v._id !== id));
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setAction(id, null); }
  };

  const rejectVehicle = async (id) => {
    setAction(id, 'reject');
    try {
      await adminAPI.rejectVehicle(id, 'Rejected by admin');
      toast.success('Vehicle rejected');
      setPendingVehicles(p => p.filter(v => v._id !== id));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setAction(id, null); }
  };

  /* ── Fleet vehicle delete ──────────────────────────────────── */
  const deleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    setAction(id, 'delete');
    try {
      await adminAPI.deleteVehicle(id);
      toast.success('Vehicle deleted');
      setAllVehicles(p => p.filter(v => v._id !== id));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setAction(id, null); }
  };

  /* ── SOS resolve ───────────────────────────────────────────── */
  const resolveSos = async (id) => {
    setAction(id, 'resolve');
    try {
      await adminAPI.resolveSos(id);
      toast.success('SOS resolved');
      setSosAlerts(p => p.filter(a => a._id !== id));
    } catch (e) { toast.error('Failed to resolve'); }
    finally { setAction(id, null); }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'drivers', label: 'Driver Approvals', icon: Users, badge: pendingDrivers.length },
    { id: 'vehicles', label: 'Vehicle Approvals', icon: Car, badge: pendingVehicles.length },
    { id: 'fleet', label: 'Fleet', icon: Car },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'sos', label: 'SOS Alerts', icon: AlertTriangle, badge: sosAlerts.length },
  ];

  const card = "rounded-2xl p-5 border border-white/10";
  const cardStyle = { background: 'rgba(17,24,39,0.85)', backdropFilter: 'blur(20px)' };

  if (loading) return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <Loader2 size={28} className="text-primary animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* SOS Banner */}
      <AnimatePresence>
        {sosAlerts.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="bg-red-600/10 border-b border-red-900/40 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.5)]">
                  <AlertTriangle size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-wide">🚨 {sosAlerts.length} Active SOS Alert{sosAlerts.length > 1 ? 's' : ''}</p>
                  <p className="text-red-200 text-xs">{sosAlerts[0]?.customerId?.name} · {new Date(sosAlerts[0]?.safetyStatus?.sosTimestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTab('sos')} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">View Alerts</button>
                <button onClick={() => resolveSos(sosAlerts[0]?._id)} className="px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20">Resolve First</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/10"
        style={{ background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">GoTo Admin</p>
              <p className="text-white/30 text-[10px]">Control Center</p>
            </div>
          </div>
          <button onClick={loadAll} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white">
            <RefreshCw size={14} />
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>
              <t.icon size={12} />
              {t.label}
              {t.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400'}`}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">

        {/* ══ OVERVIEW ══════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Users" value={stats?.users?.toLocaleString()} icon={Users} color="text-blue-400" bg="bg-blue-500/10" sub="Registered accounts" />
              <StatCard label="Total Bookings" value={stats?.bookings?.toLocaleString()} icon={BookOpen} color="text-primary" bg="bg-primary/10" sub={`${stats?.completedBookings || 0} completed`} />
              <StatCard label="Active Rides" value={stats?.activeRides ?? 0} icon={Navigation} color="text-green-400" bg="bg-green-500/10" sub="In progress now" />
              <StatCard label="Revenue" value={`₹${((stats?.revenue || 0) / 100000).toFixed(1)}L`} icon={IndianRupee} color="text-purple-400" bg="bg-purple-500/10" sub="Total earned" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pending approvals summary */}
              <div className={card} style={cardStyle}>
                <h3 className="text-white font-bold text-sm mb-4">Pending Approvals</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Driver Approvals', count: stats?.pendingDrivers || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10', tab: 'drivers' },
                    { label: 'Vehicle Approvals', count: stats?.pendingVehicles || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', tab: 'vehicles' },
                    { label: 'SOS Alerts', count: sosAlerts.length, color: 'text-red-400', bg: 'bg-red-500/10', tab: 'sos' },
                  ].map(item => (
                    <button key={item.tab} onClick={() => setTab(item.tab)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                        <span className="text-white/70 text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.bg} ${item.color}`}>{item.count}</span>
                        <ChevronRight size={12} className="text-white/20" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Platform health */}
              <div className={card} style={cardStyle}>
                <h3 className="text-white font-bold text-sm mb-4">Platform Health</h3>
                {[
                  { label: 'Booking Success Rate', value: stats?.completedBookings && stats?.bookings ? Math.round((stats.completedBookings / stats.bookings) * 100) : 0, color: 'bg-primary' },
                  { label: 'Active Drivers', value: 89, color: 'bg-green-400' },
                  { label: 'System Uptime', value: 99, color: 'bg-blue-400' },
                ].map(item => (
                  <div key={item.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40">{item.label}</span>
                      <span className="text-white/60 font-semibold">{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ DRIVER APPROVALS ══════════════════════════════════ */}
        {tab === 'drivers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Driver Approvals</h2>
              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-full">{pendingDrivers.length} pending</span>
            </div>
            {pendingDrivers.length === 0 ? (
              <div className={`${card} text-center py-10`} style={cardStyle}>
                <CheckCircle size={28} className="text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold">All caught up!</p>
                <p className="text-white/40 text-sm">No pending driver approvals</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingDrivers.map(driver => (
                  <motion.div key={driver._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={card} style={cardStyle}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary font-black flex items-center justify-center">
                          {driver.userId?.name?.charAt(0) || 'D'}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{driver.userId?.name || 'Unknown'}</p>
                          <p className="text-white/40 text-xs">{driver.userId?.email}</p>
                          <p className="text-white/30 text-xs">{driver.userId?.phone}</p>
                        </div>
                      </div>
                      <span className="text-white/20 text-[10px]">{new Date(driver.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Vehicle details */}
                    {driver.vehicleDetails && (
                      <div className="p-2 rounded-xl bg-white/5 mb-3 text-xs">
                        <span className="text-white/60">{driver.vehicleDetails.brand} {driver.vehicleDetails.model}</span>
                        <span className="text-white/30 ml-2">· {driver.vehicleDetails.licensePlate}</span>
                      </div>
                    )}
                    {/* License */}
                    {driver.licenseNumber && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[10px]">
                          <CheckCircle size={9} /> License: {driver.licenseNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => approveDriver(driver._id)} disabled={!!actionLoading[driver._id]}
                        className="flex-1 py-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/25 flex items-center justify-center gap-1 disabled:opacity-50">
                        {actionLoading[driver._id] === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                      </button>
                      <button onClick={() => rejectDriver(driver._id)} disabled={!!actionLoading[driver._id]}
                        className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 flex items-center justify-center gap-1 disabled:opacity-50">
                        {actionLoading[driver._id] === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ VEHICLE APPROVALS ═════════════════════════════════ */}
        {tab === 'vehicles' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Vehicle Approvals</h2>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full">{pendingVehicles.length} pending</span>
            </div>
            {pendingVehicles.length === 0 ? (
              <div className={`${card} text-center py-10`} style={cardStyle}>
                <Car size={28} className="text-white/10 mx-auto mb-2" />
                <p className="text-white font-bold">No pending vehicles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingVehicles.map(v => (
                  <motion.div key={v._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={card} style={cardStyle}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                          {v.vehicleType === 'bike' ? <Bike size={18} /> : <Car size={18} />}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{v.brand} {v.model}</p>
                          <p className="text-white/40 text-xs">Plate: {v.licensePlate}</p>
                          <p className="text-white/30 text-xs">Owner: {v.ownerId?.name} · {v.year}</p>
                        </div>
                      </div>
                      <span className="text-white/20 text-[10px]">{new Date(v.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      <span className="px-2 py-0.5 bg-white/5 text-white/50 rounded-full text-[10px] capitalize">{v.vehicleType}</span>
                      <span className="px-2 py-0.5 bg-white/5 text-white/50 rounded-full text-[10px] capitalize">{v.rentalType}</span>
                      {v.pricePerDay && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">₹{v.pricePerDay}/day</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveVehicle(v._id)} disabled={!!actionLoading[v._id]}
                        className="flex-1 py-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/25 flex items-center justify-center gap-1 disabled:opacity-50">
                        {actionLoading[v._id] === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Approve
                      </button>
                      <button onClick={() => rejectVehicle(v._id)} disabled={!!actionLoading[v._id]}
                        className="flex-1 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 flex items-center justify-center gap-1 disabled:opacity-50">
                        {actionLoading[v._id] === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />} Reject
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ FLEET MANAGEMENT ══════════════════════════════════ */}
        {tab === 'fleet' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Fleet Management</h2>
              <button onClick={() => setShowAddVehicle(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-orange-500">
                <Plus size={14} /> Add Vehicle
              </button>
            </div>
            {allVehicles.length === 0 ? (
              <div className={`${card} text-center py-10`} style={cardStyle}>
                <Car size={28} className="text-white/10 mx-auto mb-2" />
                <p className="text-white font-bold">No vehicles in fleet</p>
                <button onClick={() => setShowAddVehicle(true)} className="mt-3 text-primary text-xs hover:underline">Add first vehicle →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allVehicles.map(v => (
                  <motion.div key={v._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={card} style={cardStyle}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${v.isActive ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                          {v.vehicleType === 'bike' || v.vehicleType === 'scooter' ? <Bike size={16} /> : <Car size={16} />}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{v.brand} {v.model}</p>
                          <p className="text-white/40 text-xs">{v.licensePlate}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteVehicle(v._id)} disabled={!!actionLoading[v._id]}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
                        {actionLoading[v._id] === 'delete' ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center mb-3">
                      <div className="p-2 rounded-xl bg-white/5">
                        <p className="text-white/30 text-[10px]">Type</p>
                        <p className="text-white text-xs font-bold capitalize">{v.vehicleType}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5">
                        <p className="text-white/30 text-[10px]">Rental</p>
                        <p className="text-white text-xs font-bold capitalize">{v.rentalType?.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-sm font-bold">₹{v.pricePerDay || v.pricePerHour || 0}<span className="text-white/30 text-[10px]">/day</span></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.isAvailable ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                        {v.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ USERS ═════════════════════════════════════════════ */}
        {tab === 'users' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold">User Base ({allUsers.length})</h2>
            <div className={card} style={cardStyle}>
              <div className="space-y-2">
                {allUsers.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No users found</p>
                ) : allUsers.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{u.name}</p>
                        <p className="text-white/40 text-xs">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : u.role === 'driver' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-400'}`}>
                        {u.role}
                      </span>
                      <span className="text-white/20 text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ BOOKINGS ══════════════════════════════════════════ */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold">All Bookings ({allBookings.length})</h2>
            <div className={card} style={cardStyle}>
              <div className="space-y-2">
                {allBookings.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">No bookings found</p>
                ) : allBookings.map(b => (
                  <div key={b._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                        <Car size={14} className="text-white/40" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{b.customerId?.name || 'Customer'}</p>
                        <p className="text-white/40 text-xs">{b.pickupLocation?.address?.slice(0, 30) || '—'}</p>
                        <p className="text-white/20 text-[10px]">{new Date(b.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-sm">₹{b.totalAmount?.toLocaleString() || '—'}</p>
                      <span className={`text-[10px] font-bold ${b.status === 'completed' ? 'text-green-400' :
                          b.status === 'in_progress' ? 'text-primary' :
                            b.status === 'cancelled' ? 'text-red-400' : 'text-white/40'
                        }`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ LIVE MAP ══════════════════════════════════════════ */}
        {tab === 'map' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">Live Driver Locations</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/40 text-xs">{liveLocations.length} online</span>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: '500px' }}>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {liveLocations.map(loc => {
                  if (!loc.coordinates || loc.coordinates.length < 2) return null;
                  const [lng, lat] = loc.coordinates;
                  return (
                    <Marker key={loc.driverId} position={[lat, lng]} icon={driverIcon}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{loc.name}</p>
                          <p className="text-gray-500">{loc.phone}</p>
                          <p>⭐ {loc.rating?.toFixed(1)} · {loc.completedRides} rides</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
            {liveLocations.length === 0 && (
              <div className={`${card} text-center py-6`} style={cardStyle}>
                <p className="text-white/40 text-sm">No drivers currently online with location data</p>
              </div>
            )}
          </div>
        )}

        {/* ══ SOS ALERTS ════════════════════════════════════════ */}
        {tab === 'sos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">SOS Alerts</h2>
              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-full">{sosAlerts.length} active</span>
            </div>
            {sosAlerts.length === 0 ? (
              <div className={`${card} text-center py-10`} style={cardStyle}>
                <Shield size={28} className="text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold">All clear!</p>
                <p className="text-white/40 text-sm">No active SOS alerts</p>
              </div>
            ) : sosAlerts.map(alert => (
              <motion.div key={alert._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center animate-pulse">
                      <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{alert.customerId?.name || 'User'}</p>
                      <p className="text-white/40 text-xs">{alert.customerId?.phone}</p>
                      <p className="text-white/30 text-xs">{alert.pickupLocation?.address || 'Location unknown'}</p>
                    </div>
                  </div>
                  <span className="text-red-400 text-[10px] font-bold">
                    {alert.safetyStatus?.sosTimestamp ? new Date(alert.safetyStatus.sosTimestamp).toLocaleTimeString() : '—'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => resolveSos(alert._id)} disabled={!!actionLoading[alert._id]}
                    className="flex-1 py-2 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/25 flex items-center justify-center gap-1 disabled:opacity-50">
                    {actionLoading[alert._id] === 'resolve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />} Resolve
                  </button>
                  <a href={`tel:${alert.customerId?.phone}`}
                    className="flex-1 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 flex items-center justify-center gap-1">
                    <Phone size={12} /> Call User
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddVehicle && (
          <AddVehicleModal onClose={() => setShowAddVehicle(false)} onSaved={() => loadTabData('fleet')} />
        )}
      </AnimatePresence>
    </div>
  );
}
