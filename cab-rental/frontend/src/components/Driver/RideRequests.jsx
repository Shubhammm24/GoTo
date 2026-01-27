import { useEffect, useState } from 'react';
import api from '../../services/api';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getStatusBadge } from '../../utils/helpers';

const RideRequests = () => {
	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const { data } = await api.get('/drivers/requests');
			setRequests(data?.requests || []);
		} catch (err) {
			toast.error('Failed to load ride requests');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const respond = async (id, action) => {
		try {
			await api.post(`/drivers/requests/${id}/${action}`);
			setRequests((prev) => prev.filter((r) => r._id !== id));
		} catch (err) {
			toast.error('Failed to update request');
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-500">Ride requests</p>
					<p className="text-xl font-bold text-gray-900">{requests.length} waiting</p>
				</div>
				{loading && <Clock className="animate-spin text-gray-400" size={18} />}
			</div>

			<div className="space-y-3">
				{requests.map((req) => (
					<div key={req._id} className="p-4 border border-gray-200 rounded-xl">
						<div className="flex items-center justify-between mb-2">
							<p className="font-semibold text-gray-900">{req.passenger?.name || 'Passenger'}</p>
							<span className={`px-2 py-1 text-xs rounded ${getStatusBadge(req.status)}`}>{req.status}</span>
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

				{requests.length === 0 && !loading && (
					<p className="text-sm text-gray-500 text-center">No new requests</p>
				)}
			</div>
		</div>
	);
};

export default RideRequests;
