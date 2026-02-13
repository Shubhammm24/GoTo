// Pricing calculation utilities

/**
 * Calculate ride pricing based on distance, duration, vehicle type, and surge
 */
export const calculateRidePrice = ({
    distance, // in km
    duration, // in minutes
    vehicleType,
    rentalType,
    surgeMultiplier = 1,
    baseFares = null
}) => {
    // Default base fares (can be overridden by admin settings)
    const defaultBaseFares = {
        car: {
            'driver-operated': { base: 50, perKm: 12, perMin: 2 },
            'self-drive': { base: 300, perHour: 150, perKm: 8 }
        },
        bike: {
            'driver-operated': { base: 30, perKm: 8, perMin: 1.5 },
            'self-drive': { base: 200, perHour: 100, perKm: 5 }
        },
        scooter: {
            'driver-operated': { base: 25, perKm: 7, perMin: 1 },
            'self-drive': { base: 150, perHour: 80, perKm: 4 }
        }
    };

    const fares = baseFares || defaultBaseFares;
    const fareConfig = fares[vehicleType]?.[rentalType];

    if (!fareConfig) {
        throw new Error('Invalid vehicle or rental type');
    }

    let breakdown = {};

    if (rentalType === 'driver-operated') {
        // For driver-operated: base + distance + time
        breakdown.baseFare = fareConfig.base;
        breakdown.distanceFare = distance * fareConfig.perKm;
        breakdown.timeFare = duration * fareConfig.perMin;
    } else {
        // For self-drive: base + hourly + distance
        const hours = Math.ceil(duration / 60);
        breakdown.baseFare = fareConfig.base;
        breakdown.hourlyFare = hours * fareConfig.perHour;
        breakdown.distanceFare = distance * fareConfig.perKm;
    }

    // Calculate subtotal
    const subtotal = Object.values(breakdown).reduce((a, b) => a + b, 0);

    // Apply surge pricing
    breakdown.surgePricing = subtotal * (surgeMultiplier - 1);

    // Platform fee (5%)
    breakdown.platformFee = subtotal * 0.05;

    // GST (18% on platform fee)
    breakdown.gst = breakdown.platformFee * 0.18;

    // Total
    const total = subtotal + breakdown.surgePricing + breakdown.platformFee + breakdown.gst;

    return {
        breakdown,
        subtotal: Math.round(subtotal),
        total: Math.round(total),
        distance,
        duration,
        surgeMultiplier
    };
};

/**
 * Get current surge multiplier based on demand
 */
export const getSurgeMultiplier = (activeRidesCount, availableDriversCount) => {
    if (availableDriversCount === 0) return 2.5; // Max surge

    const ratio = activeRidesCount / availableDriversCount;

    if (ratio > 3) return 2.5;
    if (ratio > 2) return 2.0;
    if (ratio > 1.5) return 1.8;
    if (ratio > 1) return 1.5;
    if (ratio > 0.7) return 1.3;

    return 1.0; // No surge
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // in km
};

/**
 * Estimate duration based on distance (average speed 30 km/h in city)
 */
export const estimateDuration = (distance) => {
    const avgSpeed = 30; // km/h
    return (distance / avgSpeed) * 60; // in minutes
};
