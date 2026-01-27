import { useEffect, useState } from 'react';
import api from '../../services/api';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/helpers';

const RideHistory = () => {
	const [rides, setRides] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchRides = async () => {
			setLoading(true);
			try {
				const { data } = await api.get('/bookings/me');
				setRides(data || []);
			} catch (err) {
				// show empty state silently
			} finally {
				setLoading(false);
			}
		};
		fetchRides();
	}, []);

	return (
		<div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
			<p className="text-xl font-bold text-gray-900">Recent rides</p>
			{loading && <p className="text-sm text-gray-500">Loading...</p>}
			<div className="space-y-3">
				{rides.map((ride) => (
					<div key={ride._id} className="p-4 border border-gray-200 rounded-xl">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center space-x-2 text-sm text-gray-600">
								<Clock size={16} />
								<span>{formatDate(ride.createdAt)}</span>
							</div>
							<span className={`px-2 py-1 text-xs rounded capitalize ${getStatusBadge(ride.status)}`}>
								{ride.status}
							</span>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
							<div className="flex items-start space-x-2">
								<MapPin className="text-green-500" size={16} />
								<span>{ride.pickupLocation?.address}</span>
							</div>
							<div className="flex items-start space-x-2">
								<MapPin className="text-red-500" size={16} />
								<span>{ride.dropoffLocation?.address}</span>
							</div>
							<div className="flex items-start space-x-2">
								<DollarSign className="text-blue-500" size={16} />
								<span>{formatCurrency(ride.fare || ride.estimatedFare || 0)}</span>
							</div>
						</div>
					</div>
				))}
				{rides.length === 0 && !loading && <p className="text-sm text-gray-500">No rides yet</p>}
			</div>
		</div>
	);
};

export default RideHistory;
