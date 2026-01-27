import { useEffect, useState } from 'react';
import { Search, CarFront, Loader2 } from 'lucide-react';
import { useVehicleStore } from '../../store/index';
import { VEHICLE_TYPES } from '../../utils/constants';

const SearchVehicles = () => {
	const { vehicles, fetchVehicles, isLoading } = useVehicleStore();
	const [type, setType] = useState('all');

	useEffect(() => {
		fetchVehicles();
	}, [fetchVehicles]);

	const filtered = type === 'all' ? vehicles : vehicles.filter((v) => v.type === type);

	return (
		<div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Search size={18} className="text-blue-600" />
					<p className="font-bold text-gray-900">Browse available vehicles</p>
				</div>
				<select
					value={type}
					onChange={(e) => setType(e.target.value)}
					className="px-3 py-2 border rounded-lg text-sm"
				>
					<option value="all">All</option>
					{VEHICLE_TYPES.map((v) => (
						<option key={v.id} value={v.id}>
							{v.label}
						</option>
					))}
				</select>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-6 text-gray-500">
					<Loader2 className="animate-spin mr-2" size={18} /> Loading vehicles
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{filtered.map((veh) => (
						<div key={veh._id} className="p-4 border border-gray-200 rounded-xl">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center space-x-2">
									<CarFront className="text-blue-600" size={18} />
									<p className="font-semibold text-gray-900">{veh.model}</p>
								</div>
								<span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full capitalize">{veh.type}</span>
							</div>
							<p className="text-sm text-gray-600">Seats: {veh.capacity || veh.seats || 4}</p>
							<p className="text-sm text-gray-600">Plate: {veh.licensePlate || 'N/A'}</p>
							<p className="text-sm font-semibold text-gray-900 mt-2">₹{veh.baseFare || 0} base</p>
						</div>
					))}
					{filtered.length === 0 && (
						<p className="text-sm text-gray-500">No vehicles found</p>
					)}
				</div>
			)}
		</div>
	);
};

export default SearchVehicles;
