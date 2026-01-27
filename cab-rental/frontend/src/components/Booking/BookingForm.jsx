import { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useBooking } from '../../hooks/useBooking';
import { VEHICLE_TYPES, RENTAL_TYPES } from '../../utils/constants';
import { calculateFare } from '../../utils/helpers';

const BookingForm = ({ onBooked }) => {
	const { createWithEstimates, isLoading } = useBooking();
	const [vehicleType, setVehicleType] = useState('car');
	const [rentalType, setRentalType] = useState('driver-operated');
	const [estimates, setEstimates] = useState({ distanceKm: 10, durationMin: 15, fare: 0 });
	const [form, setForm] = useState({ pickup: '', dropoff: '' });

	useEffect(() => {
		const vehicle = VEHICLE_TYPES.find((v) => v.id === vehicleType) || VEHICLE_TYPES[1];
		const fare = calculateFare({
			baseFare: vehicle.baseFare,
			perKm: vehicle.perKm,
			perMin: vehicle.perMin,
			distanceKm: estimates.distanceKm,
			durationMin: estimates.durationMin,
			surge: 1.15,
		});
		setEstimates((prev) => ({ ...prev, fare }));
	}, [vehicleType, estimates.distanceKm, estimates.durationMin]);

	const submit = async (e) => {
		e.preventDefault();
		if (!form.pickup || !form.dropoff) {
			toast.error('Enter pickup and dropoff');
			return;
		}
		try {
			const booking = await createWithEstimates({
				pickupAddress: form.pickup,
				dropoffAddress: form.dropoff,
				vehicleType,
				rentalType,
			});
			toast.success('Booking created');
			onBooked?.(booking);
		} catch (err) {
			toast.error(err.response?.data?.message || 'Booking failed');
		}
	};

	return (
		<form onSubmit={submit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">Pickup</label>
					<div className="relative">
						<MapPin className="absolute left-3 top-3 text-green-500" size={18} />
						<input
							value={form.pickup}
							onChange={(e) => setForm({ ...form, pickup: e.target.value })}
							className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="Enter pickup location"
						/>
					</div>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">Dropoff</label>
					<div className="relative">
						<MapPin className="absolute left-3 top-3 text-red-500" size={18} />
						<input
							value={form.dropoff}
							onChange={(e) => setForm({ ...form, dropoff: e.target.value })}
							className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="Enter dropoff location"
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
						<ArrowRight size={16} /> Distance (km)
					</label>
					<input
						type="number"
						min={1}
						value={estimates.distanceKm}
						onChange={(e) => setEstimates((p) => ({ ...p, distanceKm: parseFloat(e.target.value) }))}
						className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
						<Clock size={16} /> Duration (min)
					</label>
					<input
						type="number"
						min={5}
						value={estimates.durationMin}
						onChange={(e) => setEstimates((p) => ({ ...p, durationMin: parseFloat(e.target.value) }))}
						className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
					/>
				</div>
			</div>

			<div>
				<p className="text-sm font-semibold text-gray-700 mb-2">Vehicle type</p>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{VEHICLE_TYPES.map((v) => (
						<button
							key={v.id}
							type="button"
							onClick={() => setVehicleType(v.id)}
							className={`p-4 rounded-xl border-2 text-left transition ${
								vehicleType === v.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
							}`}
						>
							<p className="font-bold text-gray-900">{v.label}</p>
							<p className="text-xs text-gray-600">Base ₹{v.baseFare}</p>
						</button>
					))}
				</div>
			</div>

			<div>
				<p className="text-sm font-semibold text-gray-700 mb-2">Rental type</p>
				<div className="grid grid-cols-2 gap-3">
					{RENTAL_TYPES.map((r) => (
						<button
							key={r.id}
							type="button"
							onClick={() => setRentalType(r.id)}
							className={`p-3 rounded-xl border-2 font-semibold transition ${
								rentalType === r.id ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-700'
							}`}
						>
							{r.label}
						</button>
					))}
				</div>
			</div>

			<div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
				<div>
					<p className="text-sm text-gray-600">Estimated fare</p>
					<p className="text-2xl font-bold text-gray-900">₹{estimates.fare.toFixed(0)}</p>
				</div>
				<button
					type="submit"
					disabled={isLoading}
					className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
				>
					{isLoading ? 'Booking...' : 'Book ride'}
				</button>
			</div>
		</form>
	);
};

export default BookingForm;
