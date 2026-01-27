import { useEffect } from 'react';
import { useVehicleStore } from '../../store/index';
import VehicleDetail from './VehicleDetail';

const VehicleList = () => {
  const { vehicles, fetchVehicles, isLoading } = useVehicleStore();

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="space-y-3">
      {isLoading && <p className="text-sm text-gray-500">Loading vehicles...</p>}
      {vehicles.map((v) => (
        <VehicleDetail key={v._id} vehicle={v} />
      ))}
      {vehicles.length === 0 && !isLoading && <p className="text-sm text-gray-500">No vehicles found</p>}
    </div>
  );
};

export default VehicleList;
