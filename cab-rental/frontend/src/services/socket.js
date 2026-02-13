import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';
let socket;

export const connectSocket = (token, user) => {
	if (socket?.connected) return socket;

	socket = io(API_URL, {
		transports: ['websocket', 'polling'],
		auth: { token, user },
	});

	socket.on('connect', () => console.log('[Socket] Connected'));
	socket.on('disconnect', () => console.log('[Socket] Disconnected'));
	socket.on('error', (error) => console.error('[Socket] Error:', error));

	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};

// Legacy ride tracking
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

// Chat Methods
export const joinRideChat = (bookingId) => {
	socket?.emit('join-ride-chat', bookingId);
};

export const leaveRideChat = (bookingId) => {
	socket?.emit('leave-ride-chat', bookingId);
};

export const sendMessageRealtime = (bookingId, message) => {
	socket?.emit('send-message-realtime', { bookingId, message });
};

export const onNewMessage = (callback) => {
	socket?.on('new-message', callback);
};

export const offNewMessage = () => {
	socket?.off('new-message');
};

export const emitTyping = (bookingId) => {
	socket?.emit('typing', bookingId);
};

export const emitStopTyping = (bookingId) => {
	socket?.emit('stop-typing', bookingId);
};

export const onUserTyping = (callback) => {
	socket?.on('user-typing', callback);
};

export const onUserStoppedTyping = (callback) => {
	socket?.on('user-stopped-typing', callback);
};

// Location Updates
export const updateLocation = (bookingId, location) => {
	socket?.emit('update-location', { bookingId, location });
};

export const onLocationUpdated = (callback) => {
	socket?.on('location-updated', callback);
};

// SOS Alerts
export const emitSOS = (data) => {
	socket?.emit('sos-alert', data);
};

export const onSOSTriggered = (callback) => {
	socket?.on('sos-triggered', callback);
};

export default {
	connectSocket,
	disconnectSocket,
	subscribeToRideUpdates,
	subscribeToDriverRequests,
	joinRideChat,
	leaveRideChat,
	sendMessageRealtime,
	onNewMessage,
	offNewMessage,
	emitTyping,
	emitStopTyping,
	onUserTyping,
	onUserStoppedTyping,
	updateLocation,
	onLocationUpdated,
	emitSOS,
	onSOSTriggered,
};
