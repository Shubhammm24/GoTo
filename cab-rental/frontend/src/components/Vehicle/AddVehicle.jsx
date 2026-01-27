import { useState } from 'react';
import toast from 'react-hot-toast';
import { useVehicleStore } from '../../store/index';
import { VEHICLE_TYPES } from '../../utils/constants';

const AddVehicle = ({ onAdded }) => {
  const { addVehicle, isLoading } = useVehicleStore();
  const [form, setForm] = useState({
    model: '',
    licensePlate: '',
    type: 'car',
    capacity: 4,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.model || !form.licensePlate) {
      toast.error('Model and license plate are required');
      return;
    }
    try {
      const vehicle = await addVehicle(form);
      toast.success('Vehicle added');
      onAdded?.(vehicle);
      setForm({ model: '', licensePlate: '', type: 'car', capacity: 4 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
      <p className="text-xl font-bold text-gray-900">Add vehicle</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Model</label>
          <input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
            placeholder="Toyota Innova"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">License plate</label>
          <input
            value={form.licensePlate}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
            placeholder="DL-01-AB-1234"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Capacity</label>
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
            className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save vehicle'}
      </button>
    </form>
  );
};

export default AddVehicle;
