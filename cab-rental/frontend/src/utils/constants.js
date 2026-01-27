export const VEHICLE_TYPES = [
	{ id: 'bike', label: 'Bike', baseFare: 30, perKm: 7, perMin: 1 },
	{ id: 'car', label: 'Car', baseFare: 50, perKm: 12, perMin: 2 },
	{ id: 'suv', label: 'SUV', baseFare: 80, perKm: 18, perMin: 3 },
];

export const RENTAL_TYPES = [
	{ id: 'driver-operated', label: 'With Driver' },
	{ id: 'self-drive', label: 'Self Drive' },
];

export const BOOKING_STATUSES = ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'];

export const PAYMENT_METHODS = ['card', 'cash', 'upi', 'wallet'];

export const ROLES = ['customer', 'driver', 'admin'];

export const SOCKET_EVENTS = {
	BOOKING_UPDATE: 'booking_update',
	RIDE_REQUEST: 'ride_request',
};

export const FALLBACK_COORDS = [72.8777, 19.076]; // Mumbai
