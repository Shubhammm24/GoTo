import { useEffect } from 'react';
import { useBookingStore } from '../store/index';
import { geocodeAddress, estimateRoute } from '../services/mapService';

export const useBooking = () => {
	const { bookings, currentBooking, isLoading, error, createBooking, fetchBookings, updateBooking } =
		useBookingStore();

	useEffect(() => {
		if (!bookings?.length) fetchBookings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const createWithEstimates = async ({ pickupAddress, dropoffAddress, vehicleType, rentalType }) => {
		const pickup = await geocodeAddress(pickupAddress);
		const dropoff = await geocodeAddress(dropoffAddress);
		const route = await estimateRoute(pickup, dropoff);

		return createBooking({
			pickupLocation: { address: pickup.formattedAddress, coordinates: pickup.coordinates },
			dropoffLocation: { address: dropoff.formattedAddress, coordinates: dropoff.coordinates },
			vehicleType,
			rentalType,
			estimatedDistance: route.distanceKm,
			estimatedDuration: route.durationMin,
		});
	};

	return {
		bookings,
		currentBooking,
		isLoading,
		error,
		createBooking,
		createWithEstimates,
		fetchBookings,
		updateBooking,
	};
};

export default useBooking;
