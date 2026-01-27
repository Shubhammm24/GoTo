import { useEffect, useState } from 'react';
import { TrendingUp, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { getStatusBadge, formatTime } from '../../utils/helpers';

const DriverDashboard = () => {
	const [stats, setStats] = useState({ today: 0, week: 0, rating: 0, trips: 0 });
	const [requests, setRequests] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const load = async () => {
		setIsLoading(true);
		try {
			const [{ data: earnings }, { data: active }] = await Promise.all([
				api.get('/drivers/earnings'),
				api.get('/drivers/requests'),
			]);
			setStats({
				today: earnings?.today || 0,
				week: earnings?.week || 0,
				rating: earnings?.rating || 0,
				trips: earnings?.trips || 0,
			});
			setRequests(active?.requests || []);
		} catch (err) {
			toast.error('Unable to load driver data');
		} finally {
			setIsLoading(false);
		}
	};

	const respond = async (id, action) => {
		try {
			await api.post(`/drivers/requests/${id}/${action}`);
			setRequests((prev) => prev.filter((r) => r._id !== id));
			toast.success(`Request ${action}`);
		} catch (err) {
			toast.error('Failed to update request');
		}
	};

	useEffect(() => {
		load();
	}, []);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				{[
					{ label: "Today's Earnings", value: stats.today },
					{ label: "Week's Earnings", value: stats.week },
					{ label: 'Rating', value: stats.rating },
					{ label: 'Trips', value: stats.trips },
				].map((item) => (
					<div key={item.label} className="p-4 bg-white rounded-xl shadow-soft">
						<p className="text-sm text-gray-500">{item.label}</p>
						<p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
					</div>
				))}
			</div>

			<div className="bg-white rounded-2xl shadow-soft p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-2">
						<TrendingUp className="text-blue-600" size={20} />
						<p className="font-bold text-gray-900">Active ride requests</p>
					</div>
					{isLoading && <Clock className="animate-spin text-gray-400" size={18} />}
				</div>

				<div className="space-y-4">
					{requests.length === 0 && <p className="text-sm text-gray-500">No active requests</p>}
					{requests.map((req) => (
						<div key={req._id} className="p-4 border border-gray-200 rounded-xl">
							<div className="flex items-center justify-between mb-2">
								<div>
									<p className="font-semibold text-gray-900">{req.passenger?.name || 'Passenger'}</p>
									<p className={`inline-block px-2 py-1 text-xs rounded ${getStatusBadge(req.status)}`}>
										{req.status}
									</p>
								</div>
								<p className="text-sm text-gray-500">{formatTime(req.createdAt)}</p>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
								<div className="flex items-start space-x-2">
									<MapPin className="text-green-500" size={16} />
									<span>{req.pickupLocation?.address}</span>
								</div>
								<div className="flex items-start space-x-2">
									<MapPin className="text-red-500" size={16} />
									<span>{req.dropoffLocation?.address}</span>
								</div>
								<div className="flex items-start space-x-2">
									<Clock className="text-blue-500" size={16} />
									<span>{req.estimatedDuration} mins</span>
								</div>
							</div>

							<div className="flex items-center justify-end space-x-3 mt-3">
								<button
									onClick={() => respond(req._id, 'accept')}
									className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold flex items-center space-x-1"
								>
									<CheckCircle size={16} />
									<span>Accept</span>
								</button>
								<button
									onClick={() => respond(req._id, 'reject')}
									className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold flex items-center space-x-1"
								>
									<XCircle size={16} />
									<span>Reject</span>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default DriverDashboard;
