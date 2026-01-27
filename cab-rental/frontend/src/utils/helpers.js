export const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(0)}`;

export const formatDate = (date) => new Date(date).toLocaleDateString();

export const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const getStatusBadge = (status) => {
	const map = {
		pending: 'bg-yellow-100 text-yellow-700',
		accepted: 'bg-blue-100 text-blue-700',
		ongoing: 'bg-indigo-100 text-indigo-700',
		completed: 'bg-green-100 text-green-700',
		cancelled: 'bg-red-100 text-red-700',
	};
	return map[status] || 'bg-gray-100 text-gray-700';
};

export const calculateFare = ({ baseFare, perKm, perMin, distanceKm, durationMin, surge = 1 }) => {
	const fare = (baseFare + distanceKm * perKm + durationMin * perMin) * surge;
	return Math.max(fare, baseFare);
};

export const shortId = (id = '') => `${id}`.slice(-6).toUpperCase();

export const maskPhone = (phone = '') => phone.replace(/.(?=.{4})/g, '•');
