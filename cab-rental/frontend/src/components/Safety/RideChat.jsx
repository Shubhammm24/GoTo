import { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';
import { joinRideChat, leaveRideChat, onNewMessage, offNewMessage, emitTyping, emitStopTyping, onUserTyping, onUserStoppedTyping } from '../../services/socket';
import { useAuthStore } from '../../store';

export default function RideChat({ bookingId, driverName }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { user } = useAuthStore();
    const { messagesByBooking, sendMessage, fetchMessages, addMessage, setUserTyping, setUserStoppedTyping, markAsRead } = useChatStore();

    const messages = messagesByBooking[bookingId] || [];

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchMessages(bookingId);
            joinRideChat(bookingId);
            markAsRead(bookingId);

            // Socket listeners
            onNewMessage((msg) => {
                if (msg.bookingId === bookingId) {
                    addMessage(bookingId, msg);
                    scrollToBottom();
                }
            });

            onUserTyping(({ userId }) => {
                if (userId !== user?.id) {
                    setUserTyping(bookingId, userId);
                    setIsTyping(true);
                }
            });

            onUserStoppedTyping(({ userId }) => {
                if (userId !== user?.id) {
                    setUserStoppedTyping(bookingId, userId);
                    setIsTyping(false);
                }
            });

            return () => {
                leaveRideChat(bookingId);
                offNewMessage();
            };
        }
    }, [isOpen, bookingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            await sendMessage(bookingId, message.trim());
            setMessage('');
            emitStopTyping(bookingId);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);

        // Emit typing indicator
        if (e.target.value && !typingTimeoutRef.current) {
            emitTyping(bookingId);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2s of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(bookingId);
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all z-50"
            >
                <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {messages.filter(m => !m.isRead && m.senderId !== user?.id).length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {messages.filter(m => !m.isRead && m.senderId !== user?.id).length}
                        </span>
                    )}
                </div>
            </motion.button>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} ${isMinimized ? 'w-80' : 'w-96'} bg-white rounded-2xl shadow-2xl z-50 overflow-hidden`}
                style={{ maxHeight: isMinimized ? '60px' : '600px' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            💬
                        </div>
                        <div>
                            <h3 className="font-semibold">{driverName || 'Driver'}</h3>
                            {isTyping && <p className="text-xs text-white/80">typing...</p>}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-3">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 mt-20">
                                    <p className="text-sm">No messages yet</p>
                                    <p className="text-xs mt-1">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isOwnMessage = msg.senderId === user?.id || msg.senderRole === (user?.role === 'driver' ? 'driver' : 'customer');

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-xs ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-2 shadow-md`}>
                                                {msg.messageType === 'system' ? (
                                                    <p className="text-xs text-center italic">{msg.message}</p>
                                                ) : (
                                                    <>
                                                        <p className="text-sm">{msg.message}</p>
                                                        <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            {formatTime(msg.timestamp || msg.createdAt)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={handleTyping}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    maxLength={500}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                {message.length}/500 characters
                            </p>
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
