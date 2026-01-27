import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
	const navigate = useNavigate();
	const { register, isLoading } = useAuth();
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
		role: 'customer',
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.name || !form.email || !form.password || !form.phone) {
			toast.error('Please fill all fields');
			return;
		}
		if (form.password !== form.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		try {
			const { confirmPassword, ...payload } = form;
			await register(payload);
			toast.success('Account created. Please login');
			navigate('/login');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Registration failed');
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-soft p-8 w-full max-w-md mx-auto">
			<div className="text-center mb-6">
				<div className="text-4xl mb-2">🚕</div>
				<h2 className="text-2xl font-bold text-gray-900">Create account</h2>
				<p className="text-gray-500">Sign up to ride or drive</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
					<div className="relative">
						<User className="absolute left-3 top-3 text-gray-400" size={18} />
						<input
							type="text"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="John Doe"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
					<div className="relative">
						<Mail className="absolute left-3 top-3 text-gray-400" size={18} />
						<input
							type="email"
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="you@example.com"
						/>
					</div>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
					<div className="relative">
						<Phone className="absolute left-3 top-3 text-gray-400" size={18} />
						<input
							type="tel"
							value={form.phone}
							onChange={(e) => setForm({ ...form, phone: e.target.value })}
							className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="+91 98765 43210"
						/>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
						<div className="relative">
							<Lock className="absolute left-3 top-3 text-gray-400" size={18} />
							<input
								type="password"
								value={form.password}
								onChange={(e) => setForm({ ...form, password: e.target.value })}
								className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
								placeholder="Min 6 chars"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-1">Confirm</label>
						<div className="relative">
							<Lock className="absolute left-3 top-3 text-gray-400" size={18} />
							<input
								type="password"
								value={form.confirmPassword}
								onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
								className="w-full pl-9 pr-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
								placeholder="Repeat password"
							/>
						</div>
					</div>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-700 mb-1">Account type</label>
					<select
						value={form.role}
						onChange={(e) => setForm({ ...form, role: e.target.value })}
						className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
					>
						<option value="customer">Customer (Rider)</option>
						<option value="driver">Driver</option>
						<option value="admin">Admin</option>
					</select>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
				>
					{isLoading ? 'Creating...' : 'Create account'}
				</button>
			</form>

			<p className="text-center text-sm text-gray-600 mt-4">
				Already registered?{' '}
				<Link to="/login" className="text-blue-600 font-semibold">Sign in</Link>
			</p>
		</div>
	);
};

export default Register;
