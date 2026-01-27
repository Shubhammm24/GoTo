import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
let socket;

export const connectSocket = (token) => {
	if (socket) return socket;
	socket = io(API_URL, {
		transports: ['websocket'],
		auth: token ? { token } : undefined,
	});
	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};

export const subscribeToRideUpdates = (bookingId, callback) => {
	if (!socket) return;
	socket.emit('join_booking', bookingId);
	socket.on('booking_update', (payload) => {
		if (payload?.bookingId === bookingId) callback(payload);
	});
};

export const subscribeToDriverRequests = (driverId, callback) => {
	if (!socket) return;
	socket.emit('join_driver', driverId);
	socket.on('ride_request', callback);
};

export default {
	connectSocket,
	disconnectSocket,
	subscribeToRideUpdates,
	subscribeToDriverRequests,
};
