import { useState, useEffect } from 'react';
import { DollarSign, Save, RotateCcw, TrendingUp, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminPricingConfig() {
    const [pricingConfig, setPricingConfig] = useState({
        car: {
            'driver-operated': { base: 50, perKm: 12, perMin: 2 },
            'self-drive': { base: 300, perHour: 150, perKm: 8 }
        },
        bike: {
            'driver-operated': { base: 30, perKm: 8, perMin: 1.5 },
            'self-drive': { base: 200, perHour: 100, perKm: 5 }
        },
        scooter: {
            'driver-operated': { base: 25, perKm: 7, perMin: 1 },
            'self-drive': { base: 150, perHour: 80, perKm: 4 }
        }
    });

    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // Load pricing config from backend or localStorage
        const saved = localStorage.getItem('pricingConfig');
        if (saved) {
            try {
                setPricingConfig(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load pricing config');
            }
        }
    }, []);

    const handleChange = (vehicleType, rentalType, field, value) => {
        setPricingConfig(prev => ({
            ...prev,
            [vehicleType]: {
                ...prev[vehicleType],
                [rentalType]: {
                    ...prev[vehicleType][rentalType],
                    [field]: parseFloat(value) || 0
                }
            }
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        setIsSaving(true);

        // Save to localStorage (in production, save to backend)
        localStorage.setItem('pricingConfig', JSON.stringify(pricingConfig));

        // TODO: Save to backend
        // await adminAPI.updatePricingConfig(pricingConfig);

        setTimeout(() => {
            setIsSaving(false);
            setHasChanges(false);
            toast.success('✅ Pricing configuration updated successfully!');
        }, 500);
    };

    const handleReset = () => {
        if (!confirm('Reset to default pricing? This will undo all changes.')) return;

        const defaultConfig = {
            car: {
                'driver-operated': { base: 50, perKm: 12, perMin: 2 },
                'self-drive': { base: 300, perHour: 150, perKm: 8 }
            },
            bike: {
                'driver-operated': { base: 30, perKm: 8, perMin: 1.5 },
                'self-drive': { base: 200, perHour: 100, perKm: 5 }
            },
            scooter: {
                'driver-operated': { base: 25, perKm: 7, perMin: 1 },
                'self-drive': { base: 150, perHour: 80, perKm: 4 }
            }
        };

        setPricingConfig(defaultConfig);
        setHasChanges(true);
        toast.success('Reset to default pricing');
    };

    const vehicleTypes = [
        { value: 'car', label: 'Car', icon: '🚗', color: 'from-blue-500 to-indigo-600' },
        { value: 'bike', label: 'Bike', icon: '🏍️', color: 'from-green-500 to-emerald-600' },
        { value: 'scooter', label: 'Scooter', icon: '🛵', color: 'from-purple-500 to-pink-600' }
    ];

    const rentalTypes = ['driver-operated', 'self-drive'];

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Settings className="mr-3 text-blue-600" size={32} />
                        Pricing Configuration
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage base fares and per-kilometer/per-minute rates for all vehicle types
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition flex items-center space-x-2"
                    >
                        <RotateCcw size={18} />
                        <span>Reset to Default</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        <Save size={18} />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-6">
                {vehicleTypes.map((vehicle) => (
                    <motion.div
                        key={vehicle.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        {/* Vehicle Header */}
                        <div className={`bg-gradient-to-r ${vehicle.color} p-6 text-white`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="text-4xl">{vehicle.icon}</div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{vehicle.label}</h2>
                                        <p className="text-white/80 text-sm">Configure pricing for {vehicle.label.toLowerCase()}s</p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-sm text-white/80">Pricing Updated</div>
                                    <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>

                        {/* Rental Types */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {rentalTypes.map((rentalType) => {
                                    const config = pricingConfig[vehicle.value][rentalType];
                                    const isDriverOperated = rentalType === 'driver-operated';

                                    return (
                                        <div key={rentalType} className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                                                {rentalType.replace('-', ' ')}
                                            </h3>

                                            <div className="space-y-4">
                                                {/* Base Fare */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Base Fare (₹)
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <DollarSign size={18} className="text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={config.base}
                                                            onChange={(e) => handleChange(vehicle.value, rentalType, 'base', e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            min="0"
                                                            step="10"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Per Km */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Per Kilometer (₹)
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <TrendingUp size={18} className="text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={config.perKm}
                                                            onChange={(e) => handleChange(vehicle.value, rentalType, 'perKm', e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            min="0"
                                                            step="0.5"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Per Minute or Per Hour */}
                                                {isDriverOperated ? (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Per Minute (₹)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={config.perMin}
                                                            onChange={(e) => handleChange(vehicle.value, rentalType, 'perMin', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            min="0"
                                                            step="0.5"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Per Hour (₹)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={config.perHour}
                                                            onChange={(e) => handleChange(vehicle.value, rentalType, 'perHour', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            min="0"
                                                            step="10"
                                                        />
                                                    </div>
                                                )}

                                                {/* Example Calculation */}
                                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-xs font-medium text-blue-900 mb-2">Example: 10 km, 30 min</div>
                                                    <div className="text-sm text-blue-800">
                                                        ₹{config.base} + (10 × ₹{config.perKm}) + (30 × ₹{config.perMin || 0}) =
                                                        <span className="font-bold ml-1">
                                                            ₹{config.base + (10 * config.perKm) + (30 * (config.perMin || 0))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Pricing Tips</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li>• <strong>Base Fare:</strong> Minimum charge for any trip</li>
                    <li>• <strong>Per Kilometer:</strong> Additional charge for each km traveled</li>
                    <li>• <strong>Per Minute:</strong> Time-based charge for driver-operated rides</li>
                    <li>• <strong>Per Hour:</strong> Rental rate for self-drive vehicles</li>
                    <li>• <strong>Platform Fee (5%):</strong> Automatically added to subtotal</li>
                    <li>• <strong>GST (18%):</strong> Applied on platform fee</li>
                    <li>• Changes take effect immediately for new bookings</li>
                </ul>
            </div>
        </div>
    );
}
