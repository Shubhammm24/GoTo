import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, MapPin, Truck, Bike, Weight, Ruler,
    ArrowRight, CheckCircle, AlertCircle, Info, Upload, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parcelsAPI } from '../services/api'; // Ensure this is exported in api.js
import toast from 'react-hot-toast';

/* ─── Components ───────────────────────────────────────────── */

const StepIndicator = ({ step, currentStep }) => {
    const isCompleted = step < currentStep;
    const isActive = step === currentStep;

    return (
        <div className="flex flex-col items-center z-10">
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 
        ${isActive ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(249,116,21,0.5)] scale-110' :
                        isCompleted ? 'bg-green-500 border-green-500 text-white' :
                            'bg-white/5 border-white/10 text-white/40'}`}
            >
                {isCompleted ? <CheckCircle size={18} /> : step}
            </div>
        </div>
    );
};

/* ─── Main Page ────────────────────────────────────────────── */

/* ─── Map Selector Component ────────────────────────────────── */
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leafet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapSelector({ onSelect, initialPos }) {
    const [position, setPosition] = useState(initialPos ? { lat: initialPos[1], lng: initialPos[0] } : null);

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                onSelect([e.latlng.lng, e.latlng.lat]);
            },
        });
        return null;
    };

    return (
        <div className="h-48 rounded-xl overflow-hidden border border-white/10 mb-4 relative z-0">
            <MapContainer
                center={initialPos ? { lat: initialPos[1], lng: initialPos[0] } : { lat: 28.6139, lng: 77.2090 }}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {position && <Marker position={position} />}
                <MapEvents />
            </MapContainer>
            <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded z-[1000] pointer-events-none">
                Tap map to select
            </div>
        </div>
    );
}

export default function ParcelBookingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pricing, setPricing] = useState({ base: 0, distance: 0, weight: 0, total: 0 });

    // Form State
    const [form, setForm] = useState({
        pickupAddress: '',
        pickupName: '',
        pickupPhone: '',
        pickupCoords: null, // [lng, lat]
        dropAddress: '',
        dropName: '',
        dropPhone: '',
        dropCoords: null,   // [lng, lat]
        description: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        category: 'standard', // standard, fragile, document
        vehicleType: 'bike'
    });

    // Derived Values
    const getVehicleIcon = (type) => {
        switch (type) {
            case 'bike': return <Bike size={24} />;
            case 'scooter': return <Bike size={24} />; // reuse bike icon for now
            case 'car': return <Truck size={24} />;
            default: return <Package size={24} />;
        }
    };

    /* ─── Validation ───────────────────────────────────────────── */
    const validateStep = (s) => {
        if (s === 1) {
            if (!form.pickupCoords) { toast.error("Please select pickup location on map"); return false; }
            return form.pickupAddress && form.pickupName && form.pickupPhone;
        }
        if (s === 2) {
            if (!form.dropCoords) { toast.error("Please select drop location on map"); return false; }
            return form.dropAddress && form.dropName && form.dropPhone;
        }
        if (s === 3) {
            return form.description && form.weight;
        }
        return true;
    };

    /* ─── Handlers ─────────────────────────────────────────────── */
    const nextStep = () => {
        if (validateStep(step)) {
            if (step === 3) calculatePrice();
            setStep(s => Math.min(s + 1, 4));
        } else {
            if (!toast.error) toast.error('Please fill in all required fields');
        }
    };

    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const calculatePrice = () => {
        // Calculate Haversine distance
        let dist = 5; // default fallback
        if (form.pickupCoords && form.dropCoords) {
            const R = 6371; // km
            const dLat = (form.dropCoords[1] - form.pickupCoords[1]) * Math.PI / 180;
            const dLon = (form.dropCoords[0] - form.pickupCoords[0]) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(form.pickupCoords[1] * Math.PI / 180) * Math.cos(form.dropCoords[1] * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            dist = Math.max(2, parseFloat((R * c).toFixed(1))); // Min 2km
        }

        const base = form.vehicleType === 'car' ? 50 : 30;
        const rate = form.vehicleType === 'car' ? 12 : 7;
        const weightCharge = Number(form.weight) > 5 ? (Number(form.weight) - 5) * 10 : 0;

        setPricing({
            base,
            distance: Math.round(dist * rate),
            weight: weightCharge,
            total: Math.round(base + (dist * rate) + weightCharge)
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                pickupLocation: {
                    address: form.pickupAddress,
                    contactName: form.pickupName,
                    contactPhone: form.pickupPhone,
                    coordinates: form.pickupCoords
                },
                dropoffLocation: {
                    address: form.dropAddress,
                    contactName: form.dropName,
                    contactPhone: form.dropPhone,
                    coordinates: form.dropCoords
                },
                parcelDetails: {
                    description: form.description,
                    weight: Number(form.weight),
                    dimensions: {
                        length: Number(form.length) || 0,
                        width: Number(form.width) || 0,
                        height: Number(form.height) || 0
                    },
                    value: 0,
                    fragile: form.category === 'fragile'
                },
                vehicleTypeRequired: form.vehicleType,
                scheduledPickupTime: new Date() // Immediate pickup
            };

            await parcelsAPI.create(payload);
            toast.success('Parcel request created successfully!');
            navigate('/history'); // Redirect to history or tracking
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    /* ─── Styles ───────────────────────────────────────────────── */
    const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all placeholder:text-white/20";
    const lbl = "text-white/40 text-xs font-bold uppercase tracking-wider mb-1.5 block ml-1";
    const card = "bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden";
    const activeCard = "bg-primary/10 border-primary text-white shadow-lg shadow-primary/10 ring-1 ring-primary";

    return (
        <div className="min-h-screen bg-bg-dark pt-20 pb-12 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
                        <Package size={14} className="text-primary" />
                        <span className="text-xs font-bold text-white/60 uppercase tracking-widest">GoTo Parcel</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Send anything, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">anywhere.</span>
                    </h1>
                    <p className="text-white/40 max-w-lg mx-auto">
                        Fast, secure, and trackable local courier service within the city.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="relative flex justify-between max-w-lg mx-auto mb-12">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    />
                    {[1, 2, 3, 4].map(s => <StepIndicator key={s} step={s} currentStep={step} />)}
                </div>

                {/* Form Container */}
                <motion.div
                    layout
                    className="bg-[#0f1420] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/50"
                >
                    <AnimatePresence mode="wait">

                        {/* STEP 1: PICKUP */}
                        {step === 1 && (
                            <motion.div
                                key={1}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Pickup Details</h2>
                                        <p className="text-white/40">Where should we pick up the parcel?</p>
                                    </div>
                                </div>

                                <div>
                                    <label className={lbl}>Apartment / Street Address</label>
                                    <input
                                        className={inp}
                                        value={form.pickupAddress}
                                        onChange={e => setForm({ ...form, pickupAddress: e.target.value })}
                                        placeholder="e.g. 123 Main St, Floor 2"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={lbl}>Contact Name</label>
                                        <input
                                            className={inp}
                                            value={form.pickupName}
                                            onChange={e => setForm({ ...form, pickupName: e.target.value })}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className={lbl}>Contact Phone</label>
                                        <input
                                            className={inp}
                                            value={form.pickupPhone}
                                            onChange={e => setForm({ ...form, pickupPhone: e.target.value })}
                                            placeholder="e.g. 98765 43210"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: DROP OFF */}
                        {step === 2 && (
                            <motion.div
                                key={2}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Delivery Details</h2>
                                        <p className="text-white/40">Where are we delivering to?</p>
                                    </div>
                                </div>

                                <div>
                                    <label className={lbl}>Apartment / Street Address</label>
                                    <input
                                        className={inp}
                                        value={form.dropAddress}
                                        onChange={e => setForm({ ...form, dropAddress: e.target.value })}
                                        placeholder="e.g. 456 Corporate Park"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={lbl}>Contact Name</label>
                                        <input
                                            className={inp}
                                            value={form.dropName}
                                            onChange={e => setForm({ ...form, dropName: e.target.value })}
                                            placeholder="e.g. Jane Smith"
                                        />
                                    </div>
                                    <div>
                                        <label className={lbl}>Contact Phone</label>
                                        <input
                                            className={inp}
                                            value={form.dropPhone}
                                            onChange={e => setForm({ ...form, dropPhone: e.target.value })}
                                            placeholder="e.g. 98765 12345"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PARCEL DETAILS */}
                        {step === 3 && (
                            <motion.div
                                key={3}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Parcel Info</h2>
                                        <p className="text-white/40">Tell us about what you're sending</p>
                                    </div>
                                </div>

                                <div>
                                    <label className={lbl}>Description of Items</label>
                                    <textarea
                                        className={`${inp} h-24 resize-none`}
                                        value={form.description}
                                        onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="e.g. Documents, Keys, Charger..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={lbl}>Weight (kg)</label>
                                        <div className="relative">
                                            <input
                                                className={inp}
                                                type="number"
                                                value={form.weight}
                                                onChange={e => setForm({ ...form, weight: e.target.value })}
                                                placeholder="approx. weight"
                                            />
                                            <Weight size={16} className="absolute right-4 top-4 text-white/20" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={lbl}>Category</label>
                                        <select
                                            className={inp}
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option value="standard" className="text-black">Standard</option>
                                            <option value="fragile" className="text-black">Fragile / Glass</option>
                                            <option value="document" className="text-black">Documents</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={lbl}>Dimensions (cm) - Optional</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input className={inp} placeholder="L" type="number" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} />
                                        <input className={inp} placeholder="W" type="number" value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} />
                                        <input className={inp} placeholder="H" type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: VEHICLE & REVIEW */}
                        {step === 4 && (
                            <motion.div
                                key={4}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Select Vehicle</h2>
                                        <p className="text-white/40">Choose the best fit for your parcel</p>
                                    </div>
                                </div>

                                {/* Vehicle Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: 'bike', label: 'Bike', desc: 'Fits up to 5kg', price: '₹' + (30 + 10 * 7) },
                                        { id: 'scooter', label: 'Scooter', desc: 'Fits up to 10kg', price: '₹' + (30 + 10 * 7) },
                                        { id: 'car', label: 'Car Trunk', desc: 'Fits up to 50kg', price: '₹' + (50 + 10 * 12) }
                                    ].map(v => (
                                        <div
                                            key={v.id}
                                            onClick={() => {
                                                setForm({ ...form, vehicleType: v.id });
                                                // Recalculate price effectively (simplified here)
                                            }}
                                            className={`${card} flex items-center gap-4 ${form.vehicleType === v.id ? activeCard : ''}`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${form.vehicleType === v.id ? 'bg-primary text-white' : 'bg-white/10 text-white/50'}`}>
                                                {getVehicleIcon(v.id)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white">{v.label}</h3>
                                                <p className="text-white/40 text-xs">{v.desc}</p>
                                            </div>
                                            {/* Price Estimate Display would go here dynamically */}
                                            {/* <span className="font-mono font-bold text-primary">{v.price}</span> */}
                                        </div>
                                    ))}
                                </div>

                                {/* Bill Summary */}
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-3">
                                    <h3 className="text-white font-bold mb-4">Fare Estimate</h3>
                                    <div className="flex justify-between text-sm text-white/50">
                                        <span>Base Fare</span>
                                        <span>₹{pricing.base}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-white/50">
                                        <span>Distance Fare</span>
                                        <span>₹{pricing.distance}</span>
                                    </div>
                                    {pricing.weight > 0 && (
                                        <div className="flex justify-between text-sm text-orange-400">
                                            <span>Heavy Item Surcharge</span>
                                            <span>+₹{pricing.weight}</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-white/10 my-2" />
                                    <div className="flex justify-between text-lg font-black text-white">
                                        <span>Total</span>
                                        <span>₹{pricing.total}</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex gap-3">
                                    <Info className="text-primary shrink-0" size={20} />
                                    <p className="text-xs text-primary/80">
                                        By proceeding, you verify that the parcel contains no illegal items.
                                        The driver may verify the contents upon pickup.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="px-6 py-4 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 4 ? handleSubmit : nextStep}
                            disabled={loading}
                            className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-orange-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    {step === 4 ? 'Confirm Booking' : 'Next Step'}
                                    {step !== 4 && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </div>

                </motion.div>

            </div>
        </div>
    );
}
