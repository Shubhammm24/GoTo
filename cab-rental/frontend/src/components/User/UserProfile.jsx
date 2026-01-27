import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const UserProfile = () => {
	const { user, logout } = useAuth();
	const [form, setForm] = useState({ name: '', phone: '', email: '' });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (user) {
			setForm({ name: user.name || '', phone: user.phone || '', email: user.email || '' });
		}
	}, [user]);

	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const { data } = await api.put('/users/me', form);
			localStorage.setItem('user', JSON.stringify(data));
			toast.success('Profile updated');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to update');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-500">Profile</p>
					<p className="text-xl font-bold text-gray-900">{user?.name}</p>
				</div>
				<button onClick={logout} className="text-sm text-red-600 font-semibold">Logout</button>
			</div>

			<form onSubmit={save} className="space-y-3">
				<div>
					<label className="text-xs text-gray-500">Full name</label>
					<input
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
					/>
				</div>
				<div>
					<label className="text-xs text-gray-500">Email</label>
					<input
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
					/>
				</div>
				<div>
					<label className="text-xs text-gray-500">Phone</label>
					<input
						value={form.phone}
						onChange={(e) => setForm({ ...form, phone: e.target.value })}
						className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
					/>
				</div>
				<button
					type="submit"
					disabled={saving}
					className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
				>
					{saving ? 'Saving...' : 'Save changes'}
				</button>
			</form>
		</div>
	);
};

export default UserProfile;
