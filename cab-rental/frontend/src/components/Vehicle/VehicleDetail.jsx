import { formatCurrency } from '../../utils/helpers';

const VehicleDetail = ({ vehicle }) => {
  if (!vehicle) return null;
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 space-y-2">
      <p className="text-xl font-bold text-gray-900">{vehicle.model}</p>
      <p className="text-sm text-gray-600">Plate: {vehicle.licensePlate}</p>
      <p className="text-sm text-gray-600">Type: {vehicle.type}</p>
      <p className="text-sm text-gray-600">Seats: {vehicle.capacity || vehicle.seats}</p>
      <p className="text-lg font-semibold text-gray-900">{formatCurrency(vehicle.baseFare || 0)} base fare</p>
    </div>
  );
};

export default VehicleDetail;
