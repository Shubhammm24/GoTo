// Lightweight helpers for map-like behaviors without external map SDKs.
// Provides distance estimation, geocoding stub, and geo utilities.
import api from './api';

// Haversine distance in km between two coordinate pairs [lng, lat]
const haversineKm = (from, to) => {
	const toRad = (deg) => (deg * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(to[1] - from[1]);
	const dLon = toRad(to[0] - from[0]);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(from[1])) *
			Math.cos(toRad(to[1])) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return +(R * c).toFixed(2);
};

export const geocodeAddress = async (address) => {
	// Calls backend helper if available, otherwise returns a stubbed coordinate.
	try {
		const { data } = await api.get('/map/geocode', { params: { address } });
		return data; // expected { coordinates: [lng, lat], formattedAddress }
	} catch (err) {
		// fallback: return a fake but consistent coordinate
		const hash = address.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
		const lat = 19 + (hash % 50) / 1000; // around Mumbai region
		const lng = 72 + (hash % 70) / 1000;
		return { coordinates: [lng, lat], formattedAddress: address };
	}
};

export const estimateRoute = async (pickup, dropoff) => {
	// pickup/dropoff: { address, coordinates: [lng, lat] }
	const from = pickup.coordinates;
	const to = dropoff.coordinates;
	const distanceKm = haversineKm(from, to) || 1;
	// rough duration: 35km/h average speed
	const durationMin = Math.max(5, Math.round((distanceKm / 35) * 60));
	return {
		distanceKm,
		durationMin,
	};
};

export const getCurrentPosition = () =>
	new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error('Geolocation not supported'));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
			reject,
			{ enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
		);
	});

export const watchPosition = (onUpdate) => {
	if (!navigator.geolocation) return null;
	return navigator.geolocation.watchPosition(
		(pos) => onUpdate([pos.coords.longitude, pos.coords.latitude]),
		() => {},
		{ enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
	);
};

export const stopWatch = (watchId) => {
	if (watchId && navigator.geolocation) {
		navigator.geolocation.clearWatch(watchId);
	}
};

export default {
	geocodeAddress,
	estimateRoute,
	getCurrentPosition,
	watchPosition,
	stopWatch,
};
