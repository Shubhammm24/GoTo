import { useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDriverStore } from '../../store/driverStore';
import toast from 'react-hot-toast';

export default function AvailabilityToggle() {
    const [isUpdating, setIsUpdating] = useState(false);
    const { isOnDuty, toggleAvailability } = useDriverStore();

    const handleToggle = async () => {
        setIsUpdating(true);

        try {
            // Get current location
            const location = await getCurrentLocation();

            await toggleAvailability(!isOnDuty, location);

            toast.success(
                !isOnDuty ? '✅ You are now online and accepting rides!' : '⏸️ You are now offline',
                { duration: 3000 }
            );
        } catch (error) {
            toast.error('Failed to update availability');
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            coordinates: [position.coords.longitude, position.coords.latitude],
                        });
                    },
                    () => {
                        // Fallback location if denied
                        resolve({ coordinates: [0, 0] });
                    }
                );
            } else {
                resolve({ coordinates: [0, 0] });
            }
        });
    };

    return (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Availability Status</h3>
                    <p className="text-blue-100">
                        {isOnDuty ? 'Currently accepting rides' : 'Currently offline'}
                    </p>
                </div>

                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${isOnDuty
                            ? 'bg-white text-green-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        } disabled:opacity-50`}
                >
                    {isUpdating ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
                    ) : isOnDuty ? (
                        <Power size={40} />
                    ) : (
                        <PowerOff size={40} />
                    )}

                    {isOnDuty && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 rounded-full border-4 border-green-400"
                        />
                    )}
                </motion.button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-blue-100 text-sm mb-1">Status</div>
                    <div className="text-2xl font-bold">
                        {isOnDuty ? 'ONLINE' : 'OFFLINE'}
                    </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="text-blue-100 text-sm mb-1">Mode</div>
                    <div className="text-2xl font-bold">
                        {isOnDuty ? 'Active' : 'Paused'}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-blue-100">
                <div className={`w-3 h-3 rounded-full ${isOnDuty ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span>{isOnDuty ? 'Ready to accept rides' : 'Not accepting rides'}</span>
            </div>
        </div>
    );
}
