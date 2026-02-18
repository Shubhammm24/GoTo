import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Clock, ChevronRight, Package,
  Car, Loader2, AlertCircle, IndianRupee, RefreshCw
} from 'lucide-react';
import { bookingsAPI, parcelsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/* ─── Status badge ─────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    requested: { label: 'Requested', cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    confirmed: { label: 'Confirmed', cls: 'bg-green-500/10 border-green-500/30 text-green-400' },
    driver_assigned: { label: 'Driver Assigned', cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    pickup_pending: { label: 'Pickup Pending', cls: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    in_progress: { label: 'In Progress', cls: 'bg-primary/10 border-primary/30 text-primary' },
    completed: { label: 'Completed', cls: 'bg-green-500/10 border-green-500/30 text-green-400' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-500/10 border-red-500/30 text-red-400' },
    // parcel statuses
    pending: { label: 'Pending', cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
    assigned: { label: 'Assigned', cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    picked_up: { label: 'Picked Up', cls: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    delivered: { label: 'Delivered', cls: 'bg-green-500/10 border-green-500/30 text-green-400' },
  };
  const s = map[status] || { label: status, cls: 'bg-white/5 border-white/10 text-white/40' };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${s.cls}`}>{s.label}</span>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function RideHistoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('rides');
  const [bookings, setBookings] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, pRes] = await Promise.all([
        bookingsAPI.getUserBookings(),
        parcelsAPI.getMyParcels(),
      ]);
      setBookings(bRes.data?.bookings || bRes.data || []);
      setParcels(pRes.data?.parcels || pRes.data || []);
    } catch (e) {
      setError('Failed to load history. Please try again.');
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cancel failed');
    }
  };

  const totalSpent = bookings.reduce((s, b) => s + (b.totalAmount || 0), 0)
    + parcels.reduce((s, p) => s + (p.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/10"
        style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-base">Ride History</h1>
            <p className="text-white/40 text-xs">All your bookings and deliveries</p>
          </div>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 text-white/40 hover:text-primary text-xs transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { id: 'rides', label: 'Rides', icon: '🚗', count: bookings.length },
            { id: 'parcels', label: 'Parcels', icon: '📦', count: parcels.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-primary text-white shadow-neon-sm' : 'text-white/50 hover:text-white'
                }`}>
              {t.icon} {t.label}
              {t.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab === t.id ? 'bg-white/20' : 'bg-white/10'
                  }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Rides', value: bookings.length, icon: '🚗' },
            { label: 'Parcels Sent', value: parcels.length, icon: '📦' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💰' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 border border-white/10 text-center"
              style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
              <p className="text-xl mb-1">{s.icon}</p>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-white/40 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="text-primary animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={load} className="ml-auto text-primary text-xs hover:underline">Retry</button>
          </div>
        )}

        {/* ── RIDES TAB ── */}
        {!loading && tab === 'rides' && (
          <AnimatePresence>
            {bookings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16">
                <p className="text-4xl mb-3">🚗</p>
                <p className="text-white font-bold">No rides yet</p>
                <p className="text-white/40 text-sm mt-1">Book your first ride to get started</p>
                <button onClick={() => navigate('/booking')}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all">
                  Book a Ride
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b, i) => (
                  <motion.div key={b._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all"
                    style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {b.rentalType === 'self-drive' ? '🔑' : '🚗'}
                        </span>
                        <div>
                          <p className="text-white text-sm font-semibold capitalize">
                            {b.rentalType === 'self-drive' ? 'Self-Drive' : 'Driver Operated'} · {b.vehicleType}
                          </p>
                          <p className="text-white/30 text-[10px]">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>

                    {/* Route */}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex flex-col items-center mt-1 gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <div className="w-px h-6 bg-white/10" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-white/70 text-xs">{b.pickupLocation?.address || 'Pickup location'}</p>
                        <p className="text-white/70 text-xs">{b.dropoffLocation?.address || (b.rentalType === 'self-drive' ? 'Self-drive (no dropoff)' : 'Dropoff location')}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1 text-primary text-sm font-bold">
                        <IndianRupee size={13} />
                        {b.totalAmount?.toLocaleString() || '—'}
                      </div>
                      <div className="flex gap-2">
                        {b.status === 'in_progress' && (
                          <button onClick={() => navigate(`/tracking/${b._id}`)}
                            className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all">
                            Track
                          </button>
                        )}
                        {['requested', 'confirmed'].includes(b.status) && (
                          <button onClick={() => handleCancel(b._id)}
                            className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-all">
                            Cancel
                          </button>
                        )}
                        <button onClick={() => navigate(`/booking`)}
                          className="px-3 py-1 bg-white/5 border border-white/10 text-white/50 rounded-lg text-xs font-semibold hover:border-white/20 transition-all flex items-center gap-1">
                          Details <ChevronRight size={11} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* ── PARCELS TAB ── */}
        {!loading && tab === 'parcels' && (
          <AnimatePresence>
            {parcels.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-16">
                <p className="text-4xl mb-3">📦</p>
                <p className="text-white font-bold">No parcels sent yet</p>
                <p className="text-white/40 text-sm mt-1">Send your first parcel delivery</p>
                <button onClick={() => navigate('/booking')}
                  className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all">
                  Send a Parcel
                </button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {parcels.map((p, i) => (
                  <motion.div key={p._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all"
                    style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-primary" />
                        <div>
                          <p className="text-white text-sm font-semibold">
                            {p.parcelDetails?.description || 'Parcel'} · {p.parcelDetails?.weight}kg
                          </p>
                          <p className="text-white/30 text-[10px]">
                            {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {p.parcelDetails?.fragile && ' · ⚠️ Fragile'}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>

                    {/* Route */}
                    <div className="flex items-start gap-2 mb-3">
                      <div className="flex flex-col items-center mt-1 gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <div className="w-px h-6 bg-white/10" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-white/70 text-xs">{p.pickupLocation?.address || 'Pickup'}</p>
                        <div>
                          <p className="text-white/70 text-xs">{p.dropoffLocation?.address || 'Delivery'}</p>
                          {p.dropoffLocation?.contactName && (
                            <p className="text-white/30 text-[10px]">
                              To: {p.dropoffLocation.contactName} · {p.dropoffLocation.contactPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1 text-primary text-sm font-bold">
                        <IndianRupee size={13} />
                        {p.totalAmount?.toLocaleString() || '—'}
                      </div>
                      {['pending'].includes(p.status) && (
                        <button onClick={async () => {
                          if (!window.confirm('Cancel this parcel?')) return;
                          try {
                            await parcelsAPI.cancel(p._id, 'Cancelled by customer');
                            toast.success('Parcel cancelled');
                            load();
                          } catch (e) {
                            toast.error(e.response?.data?.message || 'Cancel failed');
                          }
                        }}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
