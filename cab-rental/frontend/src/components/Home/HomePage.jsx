import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin } from 'lucide-react';

const HomePage = () => {
	return (
		<div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-8 shadow-soft">
			<div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
				<div className="flex-1">
					<p className="text-sm uppercase tracking-wide text-blue-100">GoTo Cab</p>
					<h1 className="text-4xl font-bold mt-2 mb-4">Ride anywhere in minutes</h1>
					<p className="text-blue-100 mb-6">Safe rides, vetted drivers, transparent pricing. Book now and track in real time.</p>
					<div className="flex flex-wrap gap-3 text-sm">
						<span className="px-3 py-2 bg-white/10 rounded-full flex items-center space-x-2">
							<Shield size={16} /> <span>Safety first</span>
						</span>
						<span className="px-3 py-2 bg-white/10 rounded-full flex items-center space-x-2">
							<Clock size={16} /> <span>Quick pickups</span>
						</span>
						<span className="px-3 py-2 bg-white/10 rounded-full flex items-center space-x-2">
							<MapPin size={16} /> <span>Live tracking</span>
						</span>
					</div>
					<div className="mt-6 flex gap-3">
						<Link
							to="/booking"
							className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:shadow-lg transition"
						>
							Book a ride
						</Link>
						<Link
							to="/register"
							className="px-6 py-3 border border-white/60 text-white font-bold rounded-lg hover:bg-white/10 transition"
						>
							Sign up
						</Link>
					</div>
				</div>

				<div className="w-full max-w-sm bg-white text-gray-900 rounded-xl p-6 shadow-lg">
					<p className="text-sm font-semibold text-gray-600 mb-2">Quick estimate</p>
					<div className="space-y-3">
						{[{ label: 'Pickup', placeholder: 'Enter pickup location' }, { label: 'Dropoff', placeholder: 'Enter destination' }].map((f) => (
							<div key={f.label}>
								<label className="text-xs text-gray-500">{f.label}</label>
								<input
									className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
									placeholder={f.placeholder}
								/>
							</div>
						))}
					</div>
					<button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg">
						Continue to booking
					</button>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
