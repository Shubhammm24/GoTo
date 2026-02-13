import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyStore } from '../../store/emergencyStore';
import toast from 'react-hot-toast';

export default function SOSButton({ bookingId, location }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [selectedType, setSelected Type] = useState('police');
    const { triggerSOS, sosActive } = useEmergencyStore();

    const handleSOSClick = () => {
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        try {
            // Get current location if not provided
            const currentLocation = location || await getCurrentLocation();

            await triggerSOS({
                bookingId,
                location: {
                    coordinates: currentLocation.coordinates || [0, 0],
                    address: currentLocation.address || 'Unknown location'
                },
                alertType: selectedType
            });

            toast.success('🚨 Emergency alert sent!', {
                duration: 5000,
                icon: '🚨',
            });

            setShowConfirm(false);
        } catch (error) {
            console.error('SOS failed:', error);
            toast.error('Failed to send SOS alert. Please try again.');
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            coordinates: [position.coords.longitude, position.coords.latitude],
                            address: 'Current location'
                        });
                    },
                    () => reject(new Error('Location access denied'))
                );
            } else {
                reject(new Error('Geolocation not supported'));
            }
        });
    };

    return (
        <>
            {/* SOS Button - Fixed bottom-left */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{
                    scale: sosActive ? [1, 1.1, 1] : 1,
                }}
                transition={{
                    repeat: sosActive ? Infinity : 0,
                    duration: 1
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSOSClick}
                className={`fixed bottom-24 left-6 ${sosActive ? 'bg-red-700 animate-pulse' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white p-5 rounded-full shadow-2xl hover:shadow-red-500/50 transition-all z-50 group`}
                aria-label="Emergency SOS"
            >
                <div className="relative">
                    <AlertTriangle size={32} className={sosActive ? 'animate-bounce' : ''} />
                    {sosActive && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping" />
                    )}
                </div>
                <div className="absolute left-full ml-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Emergency SOS
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-0 h-0 border-8 border-transparent border-r-gray-900" />
                </div>
            </motion.button>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20} />
                            </button>

                            {/* Warning Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-red-100 p-6 rounded-full">
                                    <AlertTriangle size={48} className="text-red-600" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                                Emergency Alert
                            </h2>

                            {/* Description */}
                            <div className="bg-red-50 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-gray-700 text-center mb-4">
                                    This will immediately:
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center text-gray-700">
                                        <span className="text-red-600 mr-2">✓</span>
                                        Alert selected emergency service
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <span className="text-red-600 mr-2">✓</span>
                                        Notify your emergency contacts
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <span className="text-red-600 mr-2">✓</span>
                                        Share your real-time location
                                    </li>
                                    <li className="flex items-center text-gray-700">
                                        <span className="text-red-600 mr-2">✓</span>
                                        Record trip details for safety
                                    </li>
                                </ul>
                            </div>

                            {/* Alert Type Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Alert Type
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'police', label: '🚓 Police', description: 'Contact local police' },
                                        { value: 'emergency_contact', label: '📞 Emergency Contacts', description: 'Notify saved contacts' },
                                        { value: 'platform_support', label: '🛟 Platform Support', description: 'Alert support team' }
                                    ].map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => setSelectedType(type.value)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedType === type.value
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900">{type.label}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedType === type.value ? 'border-red-500' : 'border-gray-300'
                                                    }`}>
                                                    {selectedType === type.value && (
                                                        <div className="w-3 h-3 rounded-full bg-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition shadow-lg shadow-red-500/30"
                                >
                                    Trigger SOS
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Only use in genuine emergencies. False alarms may result in account suspension.
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
