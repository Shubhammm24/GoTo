import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Car, ToggleLeft, ToggleRight, MapPin, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminVehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        vehicleType: 'car',
        licensePlate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        seatCapacity: 4,
        rentalType: 'both',
        pricePerHour: 100,
        pricePerDay: 800,
        location: {
            coordinates: [77.2090, 28.6139] // Default: Delhi
        }
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vehicles', {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            });
            setVehicles(response.data.vehicles || []);
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            toast.error('Failed to load vehicles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: formData.location.coordinates
                }
            };

            if (editingVehicle) {
                await api.put(`/vehicles/${editingVehicle._id}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
                });
                toast.success('Vehicle updated successfully');
            } else {
                await api.post('/vehicles', payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
                });
                toast.success('Vehicle added successfully');
            }

            resetForm();
            fetchVehicles();
        } catch (error) {
            console.error('Failed to save vehicle:', error);
            toast.error(error.response?.data?.message || 'Failed to save vehicle');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            vehicleType: vehicle.vehicleType,
            licensePlate: vehicle.licensePlate,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            seatCapacity: vehicle.seatCapacity,
            rentalType: vehicle.rentalType,
            pricePerHour: vehicle.pricePerHour,
            pricePerDay: vehicle.pricePerDay,
            location: {
                coordinates: vehicle.location?.coordinates || [77.2090, 28.6139]
            }
        });
        setShowAddForm(true);
    };

    const handleToggleAvailability = async (vehicleId) => {
        try {
            await api.patch(`/vehicles/${vehicleId}/toggle-availability`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            });
            toast.success('Vehicle availability updated');
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to update availability');
        }
    };

    const handleDelete = async (vehicleId) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;

        try {
            await api.delete(`/vehicles/${vehicleId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            });
            toast.success('Vehicle deleted successfully');
            fetchVehicles();
        } catch (error) {
            toast.error('Failed to delete vehicle');
        }
    };

    const resetForm = () => {
        setFormData({
            vehicleType: 'car',
            licensePlate: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            seatCapacity: 4,
            rentalType: 'both',
            pricePerHour: 100,
            pricePerDay: 800,
            location: {
                coordinates: [77.2090, 28.6139]
            }
        });
        setEditingVehicle(null);
        setShowAddForm(false);
    };

    const vehicleTypeIcons = {
        car: '🚗',
        bike: '🏍️',
        scooter: '🛵'
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Car className="mr-3 text-blue-600" size={32} />
                        Vehicle Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Add and manage vehicles for self-drive rentals
                    </p>
                </div>

                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-600/30 flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Vehicle</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Total Vehicles</div>
                    <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
                </div>
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                    <div className="text-sm text-green-700 mb-1">Available</div>
                    <div className="text-3xl font-bold text-green-600">
                        {vehicles.filter(v => v.isAvailable).length}
                    </div>
                </div>
                <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                    <div className="text-sm text-orange-700 mb-1">In Use</div>
                    <div className="text-3xl font-bold text-orange-600">
                        {vehicles.filter(v => !v.isAvailable).length}
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                    <div className="text-sm text-blue-700 mb-1">Self-Drive Only</div>
                    <div className="text-3xl font-bold text-blue-600">
                        {vehicles.filter(v => v.rentalType === 'self-drive').length}
                    </div>
                </div>
            </div>

            {/* Vehicles List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
                </div>
            ) : vehicles.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
                    <Car size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicles Added</h3>
                    <p className="text-gray-600 mb-6">
                        Start by adding your first vehicle to the fleet
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                        Add First Vehicle
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {vehicles.map((vehicle, index) => (
                            <motion.div
                                key={vehicle._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Icon */}
                                        <div className="text-5xl">
                                            {vehicleTypeIcons[vehicle.vehicleType]}
                                        </div>

                                        {/* Vehicle Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {vehicle.brand} {vehicle.model}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${vehicle.isAvailable
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {vehicle.isAvailable ? 'Available' : 'In Use'}
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                                                    {vehicle.rentalType.replace('-', ' ')}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">License:</span> {vehicle.licensePlate}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Year:</span> {vehicle.year}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Seats:</span> {vehicle.seatCapacity}
                                                </div>
                                                <div className="flex items-center">
                                                    <DollarSign size={14} className="mr-1" />
                                                    <span>₹{vehicle.pricePerHour}/hr, ₹{vehicle.pricePerDay}/day</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center mt-2 text-xs text-gray-500">
                                                <MapPin size={12} className="mr-1" />
                                                <span>Rating: {vehicle.rating || 0}⭐ • Rides: {vehicle.totalRides || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleToggleAvailability(vehicle._id)}
                                            className={`p-3 rounded-xl transition ${vehicle.isAvailable
                                                    ? 'hover:bg-orange-50 text-orange-600'
                                                    : 'hover:bg-green-50 text-green-600'
                                                }`}
                                            title={vehicle.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                                        >
                                            {vehicle.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(vehicle)}
                                            className="p-3 hover:bg-blue-50 rounded-xl transition text-blue-600"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vehicle._id)}
                                            className="p-3 hover:bg-red-50 rounded-xl transition text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Vehicle Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Vehicle Type *
                                        </label>
                                        <select
                                            value={formData.vehicleType}
                                            onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="car">Car 🚗</option>
                                            <option value="bike">Bike 🏍️</option>
                                            <option value="scooter">Scooter 🛵</option>
                                        </select>
                                    </div>

                                    {/* Rental Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rental Type *
                                        </label>
                                        <select
                                            value={formData.rentalType}
                                            onChange={(e) => setFormData({ ...formData, rentalType: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="self-drive">Self-Drive Only</option>
                                            <option value="driver-operated">Driver-Operated Only</option>
                                            <option value="both">Both</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Brand */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Brand *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Toyota, Honda"
                                        />
                                    </div>

                                    {/* Model */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Model *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., Fortuner, City"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {/* License Plate */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            License Plate *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.licensePlate}
                                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="DL01AB1234"
                                        />
                                    </div>

                                    {/* Year */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Year *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                            required
                                            min="2000"
                                            max={new Date().getFullYear() + 1}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Seat Capacity */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Seats *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.seatCapacity}
                                            onChange={(e) => setFormData({ ...formData, seatCapacity: parseInt(e.target.value) })}
                                            required
                                            min="1"
                                            max="20"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Price Per Hour */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price Per Hour (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.pricePerHour}
                                            onChange={(e) => setFormData({ ...formData, pricePerHour: parseInt(e.target.value) })}
                                            required
                                            min="10"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Price Per Day */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Price Per Day (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.pricePerDay}
                                            onChange={(e) => setFormData({ ...formData, pricePerDay: parseInt(e.target.value) })}
                                            required
                                            min="100"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition shadow-lg shadow-blue-600/30 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
