import { create } from 'zustand';
import { parcelsAPI } from '../services/api';

export const useParcelStore = create((set, get) => ({
    // State
    parcels: [],
    currentParcel: null,
    isLoading: false,
    error: null,

    // Actions
    createParcel: async (parcelData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await parcelsAPI.create(parcelData);
            set((state) => ({
                parcels: [response.data.parcel, ...state.parcels],
                currentParcel: response.data.parcel,
                isLoading: false,
            }));
            return response.data.parcel;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create parcel';
            set({ isLoading: false, error: message });
            throw error;
        }
    },

    fetchMyParcels: async () => {
        set({ isLoading: true });
        try {
            const response = await parcelsAPI.getMyParcels();
            set({ parcels: response.data.parcels, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch parcels', isLoading: false });
        }
    },

    fetchParcelById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await parcelsAPI.getById(id);
            set({ currentParcel: response.data.parcel, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch parcel', isLoading: false });
        }
    },

    assignDriver: async (parcelId, driverId) => {
        set({ isLoading: true });
        try {
            const response = await parcelsAPI.assignDriver(parcelId, driverId);
            // Update parcel in list
            const parcels = get().parcels.map(p =>
                p._id === parcelId ? response.data.parcel : p
            );
            set({
                parcels,
                currentParcel: response.data.parcel,
                isLoading: false
            });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    confirmPickup: async (parcelId, pickupProof) => {
        set({ isLoading: true });
        try {
            const response = await parcelsAPI.confirmPickup(parcelId, pickupProof);
            const parcels = get().parcels.map(p =>
                p._id === parcelId ? response.data.parcel : p
            );
            set({ parcels, currentParcel: response.data.parcel, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    confirmDelivery: async (parcelId, deliveryProof) => {
        set({ isLoading: true });
        try {
            const response = await parcelsAPI.confirmDelivery(parcelId, deliveryProof);
            const parcels = get().parcels.map(p =>
                p._id === parcelId ? response.data.parcel : p
            );
            set({ parcels, currentParcel: response.data.parcel, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    cancelParcel: async (parcelId, reason) => {
        set({ isLoading: true });
        try {
            const response = await parcelsAPI.cancel(parcelId, reason);
            const parcels = get().parcels.map(p =>
                p._id === parcelId ? response.data.parcel : p
            );
            set({ parcels, isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
