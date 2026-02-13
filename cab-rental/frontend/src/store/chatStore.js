import { create } from 'zustand';
import { chatAPI } from '../services/api';

export const useChatStore = create((set, get) => ({
    // State
    messagesByBooking: {}, // { bookingId: [...messages] }
    typingUsers: {}, // { bookingId: Set<userId> }
    unreadCounts: {}, // { bookingId: number }
    isLoading: false,
    error: null,

    // Actions
    fetchMessages: async (bookingId) => {
        set({ isLoading: true });
        try {
            const response = await chatAPI.getMessages(bookingId);
            set((state) => ({
                messagesByBooking: {
                    ...state.messagesByBooking,
                    [bookingId]: response.data.messages,
                },
                unreadCounts: {
                    ...state.unreadCounts,
                    [bookingId]: 0, // Reset unread when fetching
                },
                isLoading: false,
            }));
        } catch (error) {
            set({ error: 'Failed to fetch messages', isLoading: false });
        }
    },

    sendMessage: async (bookingId, message) => {
        set({ isLoading: true });
        try {
            const response = await chatAPI.sendMessage(bookingId, message);
            const messages = get().messagesByBooking[bookingId] || [];
            set((state) => ({
                messagesByBooking: {
                    ...state.messagesByBooking,
                    [bookingId]: [...messages, response.data.message],
                },
                isLoading: false,
            }));
            return response.data.message;
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    addMessage: (bookingId, message) => {
        const messages = get().messagesByBooking[bookingId] || [];
        set((state) => ({
            messagesByBooking: {
                ...state.messagesByBooking,
                [bookingId]: [...messages, message],
            },
        }));

        // Increment unread count if not on current chat
        // (this will be called from Socket.io)
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [bookingId]: (state.unreadCounts[bookingId] || 0) + 1,
            },
        }));
    },

    markAsRead: async (bookingId) => {
        try {
            await chatAPI.markAsRead(bookingId);
            set((state) => ({
                unreadCounts: {
                    ...state.unreadCounts,
                    [bookingId]: 0,
                },
            }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    },

    deleteHistory: async (bookingId) => {
        set({ isLoading: true });
        try {
            await chatAPI.deleteHistory(bookingId);
            const { [bookingId]: removed, ...rest } = get().messagesByBooking;
            set({ messagesByBooking: rest, isLoading: false });
        } catch (error) {
            set({ error: error.response?.data?.message, isLoading: false });
            throw error;
        }
    },

    // Typing indicators (for Socket.io)
    setUserTyping: (bookingId, userId) => {
        const typingSet = get().typingUsers[bookingId] || new Set();
        typingSet.add(userId);
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [bookingId]: typingSet,
            },
        }));
    },

    setUserStoppedTyping: (bookingId, userId) => {
        const typingSet = get().typingUsers[bookingId] || new Set();
        typingSet.delete(userId);
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [bookingId]: typingSet,
            },
        }));
    },

    clearChat: (bookingId) => {
        set((state) => {
            const { [bookingId]: removed, ...rest } = state.messagesByBooking;
            return { messagesByBooking: rest };
        });
    },

    clearError: () => set({ error: null }),
}));
