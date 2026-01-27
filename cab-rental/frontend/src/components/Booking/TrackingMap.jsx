import { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, AlertCircle } from 'lucide-react';
import { connectSocket, subscribeToRideUpdates, disconnectSocket } from '../../services/socket';
import { estimateRoute } from '../../services/mapService';
import { formatTime } from '../../utils/helpers';

const TrackingMap = ({ booking }) => {
	const [status, setStatus] = useState(booking?.status || 'pending');
	const [eta, setEta] = useState(null);

	useEffect(() => {
		const socket = connectSocket(localStorage.getItem('authToken'));
		subscribeToRideUpdates(booking._id, (payload) => {
			setStatus(payload.status);
			if (payload.driverLocation && booking.dropoffLocation) {
				estimateRoute({ coordinates: payload.driverLocation }, booking.dropoffLocation).then((route) =>
					setEta(route.durationMin)
				);
			}
		});
		return () => disconnectSocket();
	}, [booking]);

	return (
		<div className="bg-white rounded-2xl shadow-soft overflow-hidden">
			<div className="w-full h-72 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-6xl mb-3">🗺️</div>
					<p className="text-gray-700 font-semibold">Live tracking coming soon</p>
					<p className="text-sm text-gray-500">Booking #{booking?._id?.slice(-6)}</p>
				</div>
			</div>

			<div className="p-6 space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex items-start space-x-3">
						<MapPin className="text-green-500" size={20} />
						<div>
							<p className="text-xs text-gray-500">Pickup</p>
							<p className="font-semibold text-gray-900">{booking?.pickupLocation?.address}</p>
						</div>
					</div>
					<div className="flex items-start space-x-3">
						<Navigation className="text-red-500" size={20} />
						<div>
							<p className="text-xs text-gray-500">Dropoff</p>
							<p className="font-semibold text-gray-900">{booking?.dropoffLocation?.address}</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="p-4 bg-blue-50 rounded-xl">
						<p className="text-xs text-gray-500">Status</p>
						<p className="font-bold text-blue-700 capitalize">{status}</p>
					</div>
					<div className="p-4 bg-green-50 rounded-xl">
						<p className="text-xs text-gray-500">ETA</p>
						<p className="font-bold text-green-700">{eta ? `${eta} mins` : 'Calculating...'}</p>
					</div>
				</div>

				<div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
					<AlertCircle className="text-yellow-600" size={18} />
					<div>
						<p className="text-sm font-semibold text-yellow-900">Driver en route</p>
						<p className="text-xs text-yellow-800">Updated at {formatTime(new Date())}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TrackingMap;
