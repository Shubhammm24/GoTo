import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
    Loader2, X, CheckCircle, AlertTriangle, Search
} from 'lucide-react';
import { vehiclesAPI } from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Segment helper ──────────────────────────────────────── */
function getSegment(v) {
    if (v.vehicleType === 'bike') return { label: 'Bike', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
    if (v.vehicleType === 'scooter') return { label: 'Scooter', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
    if (v.pricePerDay < 1400) return { label: 'Hatchback', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
    if (v.pricePerDay < 1700) return { label: 'Compact SUV', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
    if (v.pricePerDay < 2000) return { label: 'Premium SUV', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
    return { label: 'Luxury', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' };
}

/* ─── Default form state ──────────────────────────────────── */
const EMPTY_FORM = {
    brand: '', model: '', year: new Date().getFullYear(), seatCapacity: 4,
    licensePlate: '', vehicleType: 'car', rentalType: 'self-drive',
    pricePerHour: '', pricePerDay: '', isAvailable: true,
    location: { coordinates: [77.2090, 28.6139] }, // Default Delhi
};

/* ─── Main Component ──────────────────────────────────────── */
export default function AdminVehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    /* ── Load vehicles ─────────────────────────────────────── */
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await vehiclesAPI.getAll();
            setVehicles(res.data?.vehicles || res.data || []);
        } catch (e) {
            toast.error('Failed to load vehicles');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* ── Open add form ─────────────────────────────────────── */
    const openAdd = () => {
        setEditVehicle(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    /* ── Open edit form ────────────────────────────────────── */
    const openEdit = (v) => {
        setEditVehicle(v);
        setForm({
            brand: v.brand || '', model: v.model || '', year: v.year || new Date().getFullYear(),
            seatCapacity: v.seatCapacity || 4, licensePlate: v.licensePlate || '',
            vehicleType: v.vehicleType || 'car', rentalType: v.rentalType || 'self-drive',
            pricePerHour: v.pricePerHour || '', pricePerDay: v.pricePerDay || '',
            isAvailable: v.isAvailable !== false,
            location: v.location || { coordinates: [77.2090, 28.6139] },
        });
        setShowForm(true);
    };

    /* ── Save (create or update) ───────────────────────────── */
    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.brand || !form.model || !form.licensePlate) {
            toast.error('Brand, model, and license plate are required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                year: Number(form.year),
                seatCapacity: Number(form.seatCapacity),
                pricePerHour: Number(form.pricePerHour),
                pricePerDay: Number(form.pricePerDay),
                location: {
                    type: 'Point',
                    coordinates: form.location?.coordinates || [77.2090, 28.6139],
                },
            };
            if (editVehicle) {
                await vehiclesAPI.update(editVehicle._id, payload);
                toast.success('Vehicle updated!');
            } else {
                await vehiclesAPI.create(payload);
                toast.success('Vehicle added!');
            }
            setShowForm(false);
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    /* ── Toggle availability ───────────────────────────────── */
    const handleToggle = async (v) => {
        try {
            await vehiclesAPI.update(v._id, { isAvailable: !v.isAvailable });
            toast.success(`Vehicle ${!v.isAvailable ? 'enabled' : 'disabled'}`);
            load();
        } catch { toast.error('Toggle failed'); }
    };

    /* ── Delete ────────────────────────────────────────────── */
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        setDeleting(id);
        try {
            await vehiclesAPI.delete(id);
            toast.success('Vehicle deleted');
            load();
        } catch { toast.error('Delete failed'); }
        finally { setDeleting(null); }
    };

    /* ── Filtered list ─────────────────────────────────────── */
    const filtered = vehicles.filter(v => {
        const matchType = typeFilter === 'all' || v.vehicleType === typeFilter;
        const q = search.toLowerCase();
        const matchSearch = !q || `${v.brand} ${v.model} ${v.licensePlate}`.toLowerCase().includes(q);
        return matchType && matchSearch;
    });

    /* ── Input helper ──────────────────────────────────────── */
    const inp = (field, label, type = 'text', extra = {}) => (
        <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{label}</label>
            <input
                type={type} value={form[field]} required={extra.required}
                min={extra.min} max={extra.max} step={extra.step}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={extra.placeholder || label}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
            />
        </div>
    );

    const sel = (field, label, options) => (
        <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{label}</label>
            <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full bg-surface-2 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all">
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-dark p-4 md:p-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Car size={20} className="text-primary" /> Vehicle Management
                    </h1>
                    <p className="text-white/40 text-sm mt-0.5">{vehicles.length} vehicles in fleet</p>
                </div>
                <button onClick={openAdd}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-neon-sm hover:shadow-neon">
                    <Plus size={16} /> Add Vehicle
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by brand, model, plate..."
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                </div>
                <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                    {['all', 'car', 'bike', 'scooter'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${typeFilter === t ? 'bg-primary text-white' : 'text-white/40 hover:text-white'
                                }`}>{t}</button>
                    ))}
                </div>
            </div>

            {/* ── Vehicle Grid ── */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="text-primary animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-white/30">
                    <Car size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No vehicles found</p>
                    <button onClick={openAdd} className="mt-4 text-primary text-sm hover:underline">Add your first vehicle</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(v => {
                        const seg = getSegment(v);
                        const typeIcon = v.vehicleType === 'bike' ? '🏍️' : v.vehicleType === 'scooter' ? '🛵' : '🚗';
                        return (
                            <motion.div key={v._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all"
                                style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{typeIcon}</span>
                                        <div>
                                            <p className="text-white font-bold text-sm">{v.brand} {v.model}</p>
                                            <p className="text-white/40 text-[10px]">{v.year} · {v.licensePlate}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${seg.bg} ${seg.color}`}>
                                        {seg.label}
                                    </span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="bg-white/5 rounded-xl p-2 text-center">
                                        <p className="text-white text-xs font-bold">₹{v.pricePerHour}</p>
                                        <p className="text-white/30 text-[9px]">per hour</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 text-center">
                                        <p className="text-primary text-xs font-bold">₹{v.pricePerDay}</p>
                                        <p className="text-white/30 text-[9px]">per day</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 text-center">
                                        <p className="text-white text-xs font-bold">{v.seatCapacity}</p>
                                        <p className="text-white/30 text-[9px]">seats</p>
                                    </div>
                                </div>

                                {/* Status + actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggle(v)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${v.isAvailable
                                                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                                    : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                                                }`}>
                                            {v.isAvailable
                                                ? <><CheckCircle size={10} /> Available</>
                                                : <><AlertTriangle size={10} /> Unavailable</>
                                            }
                                        </button>
                                        <span className="text-[10px] text-white/30 capitalize">{v.rentalType}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => openEdit(v)}
                                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center">
                                            <Edit2 size={11} />
                                        </button>
                                        <button onClick={() => handleDelete(v._id)} disabled={deleting === v._id}
                                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center justify-center">
                                            {deleting === v._id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── Add/Edit Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                        onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden"
                            style={{ background: 'rgba(17,24,39,0.98)', backdropFilter: 'blur(20px)' }}>
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                                    <Car size={16} className="text-primary" />
                                    {editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSave} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-3">
                                    {inp('brand', 'Brand *', 'text', { required: true, placeholder: 'e.g. Maruti Suzuki' })}
                                    {inp('model', 'Model *', 'text', { required: true, placeholder: 'e.g. Swift' })}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {inp('year', 'Year', 'number', { min: 2000, max: 2026 })}
                                    {inp('seatCapacity', 'Seats', 'number', { min: 1, max: 9 })}
                                </div>
                                {inp('licensePlate', 'License Plate *', 'text', { required: true, placeholder: 'e.g. DL01AB1234' })}
                                <div className="grid grid-cols-2 gap-3">
                                    {sel('vehicleType', 'Vehicle Type', [
                                        { value: 'car', label: '🚗 Car' },
                                        { value: 'bike', label: '🏍️ Bike' },
                                        { value: 'scooter', label: '🛵 Scooter' },
                                    ])}
                                    {sel('rentalType', 'Rental Type', [
                                        { value: 'self-drive', label: 'Self Drive' },
                                        { value: 'driver-operated', label: 'Driver Operated' },
                                        { value: 'both', label: 'Both' },
                                    ])}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {inp('pricePerHour', 'Price / Hour (₹)', 'number', { min: 1, placeholder: '150' })}
                                    {inp('pricePerDay', 'Price / Day (₹)', 'number', { min: 1, placeholder: '1200' })}
                                </div>

                                {/* Location (lng, lat) */}
                                <div>
                                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                                        Location (Longitude, Latitude)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" step="any"
                                            value={form.location?.coordinates?.[0] || ''}
                                            onChange={e => setForm(f => ({ ...f, location: { ...f.location, coordinates: [parseFloat(e.target.value) || 0, f.location?.coordinates?.[1] || 0] } }))}
                                            placeholder="Longitude (e.g. 77.2090)"
                                            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                                        <input type="number" step="any"
                                            value={form.location?.coordinates?.[1] || ''}
                                            onChange={e => setForm(f => ({ ...f, location: { ...f.location, coordinates: [f.location?.coordinates?.[0] || 0, parseFloat(e.target.value) || 0] } }))}
                                            placeholder="Latitude (e.g. 28.6139)"
                                            className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
                                    </div>
                                    <p className="text-white/20 text-[10px] mt-1">Tip: find coordinates on Google Maps → right-click → "What's here?"</p>
                                </div>

                                {/* Availability toggle */}
                                <button type="button" onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${form.isAvailable
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                            : 'bg-white/5 border-white/10 text-white/40'
                                        }`}>
                                    <span className="text-xs font-medium">Available for booking</span>
                                    <span className={`w-8 h-4 rounded-full relative transition-all ${form.isAvailable ? 'bg-green-500' : 'bg-white/10'}`}>
                                        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${form.isAvailable ? 'left-4' : 'left-0.5'}`} />
                                    </span>
                                </button>

                                {/* Submit */}
                                <button type="submit" disabled={saving}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-neon-sm disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                                    {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : (editVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
