import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
	const navigate = useNavigate();
	const { login, isLoading } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [form, setForm] = useState({ email: '', password: '' });

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.email || !form.password) {
			toast.error('Please fill all fields');
			return;
		}
		try {
			await login(form.email, form.password);
			toast.success('Logged in');
			navigate('/');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Login failed');
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-soft p-8 w-full max-w-md mx-auto">
			<div className="text-center mb-6">
				<div className="text-4xl mb-2">🚕</div>
				<h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
				<p className="text-gray-500">Sign in to continue</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
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
					<label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
					<div className="relative">
						<Lock className="absolute left-3 top-3 text-gray-400" size={18} />
						<input
							type={showPassword ? 'text' : 'password'}
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							className="w-full pl-9 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="••••••••"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((p) => !p)}
							className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
						>
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
				>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<p className="text-center text-sm text-gray-600 mt-4">
				No account?{' '}
				<Link to="/register" className="text-blue-600 font-semibold">Create one</Link>
			</p>
		</div>
	);
};

export default Login;
