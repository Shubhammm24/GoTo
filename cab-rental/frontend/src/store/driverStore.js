import { create } from 'zustand';
import { driversAPI } from '../services/api';

export const useDriverStore = create((set, get) => ({
    // State
    profile: null,
    assignedRides: [],
    rideHistory: [],
    earnings: null,
    isOnDuty: false,
    isLoading: false,
    error: null,

    // Actions
    registerDriver: async (driverData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await driversAPI.register(driverData);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            set({ isLoading: false, error: message });
            throw error;
        }
    },

    completeRegistration: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await driversAPI.completeRegistration(data);
            set({ profile: response.data.driver, isLoading: false });
            return response.data;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message });
            throw error;
        }
    },

    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.getProfile();
            set({
                profile: response.data.driver,
                isOnDuty: response.data.driver.isOnDuty,
                isLoading: false
            });
        } catch (error) {
            set({ error: 'Failed to fetch profile', isLoading: false });
        }
    },

    toggleAvailability: async (isOnDuty, location) => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.toggleAvailability({
                isOnDuty,
                currentLocation: location
            });
            set({
                profile: response.data.driver,
                isOnDuty: response.data.driver.isOnDuty,
                isLoading: false
            });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    updateLocation: async (coordinates) => {
        try {
            await driversAPI.updateLocation(coordinates);
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    },

    fetchAssignedRides: async () => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.getAssignedRides();
            set({ assignedRides: response.data.rides, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch rides', isLoading: false });
        }
    },

    acceptRide: async (rideId) => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.acceptRide(rideId);
            // Update assigned rides
            const rides = get().assignedRides;
            const updated = rides.map(r => r._id === rideId ? response.data.booking : r);
            set({ assignedRides: updated, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    rejectRide: async (rideId, reason) => {
        set({ isLoading: true });
        try {
            await driversAPI.rejectRide(rideId, reason);
            // Remove from assigned rides
            const rides = get().assignedRides.filter(r => r._id !== rideId);
            set({ assignedRides: rides, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    startRide: async (rideId) => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.startRide(rideId);
            const rides = get().assignedRides.map(r =>
                r._id === rideId ? response.data.booking : r
            );
            set({ assignedRides: rides, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    fetchEarnings: async () => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.getEarnings();
            set({ earnings: response.data.earnings, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch earnings', isLoading: false });
        }
    },

    fetchRideHistory: async (params) => {
        set({ isLoading: true });
        try {
            const response = await driversAPI.getRideHistory(params);
            set({ rideHistory: response.data.rides, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch history', isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
