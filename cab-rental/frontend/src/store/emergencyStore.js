import { create } from 'zustand';
import { emergencyAPI } from '../services/api';

export const useEmergencyStore = create((set, get) => ({
    // State
    contacts: [],
    safetySettings: {
        enableEmergencySharing: false,
        shareLocationAfterRide: false,
        sosEnabled: true,
    },
    sosActive: false,
    isLoading: false,
    error: null,

    // Emergency Contacts Actions
    addContact: async (contactData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await emergencyAPI.addContact(contactData);
            set((state) => ({
                contacts: [...state.contacts, response.data.contact],
                isLoading: false,
            }));
            return response.data.contact;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add contact';
            set({ isLoading: false, error: message });
            throw error;
        }
    },

    fetchContacts: async () => {
        set({ isLoading: true });
        try {
            const response = await emergencyAPI.getContacts();
            set({ contacts: response.data.contacts, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch contacts', isLoading: false });
        }
    },

    updateContact: async (id, data) => {
        set({ isLoading: true });
        try {
            const response = await emergencyAPI.updateContact(id, data);
            const contacts = get().contacts.map(c =>
                c._id === id ? response.data.contact : c
            );
            set({ contacts, isLoading: false });
            return response.data.contact;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    deleteContact: async (id) => {
        set({ isLoading: true });
        try {
            await emergencyAPI.deleteContact(id);
            const contacts = get().contacts.filter(c => c._id !== id);
            set({ contacts, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    // SOS Actions
    triggerSOS: async (sosData) => {
        set({ isLoading: true, error: null, sosActive: true });
        try {
            const response = await emergencyAPI.triggerSOS(sosData);
            set({ isLoading: false });
            return response.data.alert;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to trigger SOS';
            set({ isLoading: false, error: message, sosActive: false });
            throw error;
        }
    },

    shareLocation: async (bookingId, location) => {
        set({ isLoading: true });
        try {
            const response = await emergencyAPI.shareLocation(bookingId, location);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    // Safety Settings
    updateSettings: async (settings) => {
        set({ isLoading: true });
        try {
            const response = await emergencyAPI.updateSettings(settings);
            set({
                safetySettings: response.data.safetySettings,
                isLoading: false
            });
            return response.data.safetySettings;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    deactivateSOS: () => set({ sosActive: false }),

    clearError: () => set({ error: null }),
}));
