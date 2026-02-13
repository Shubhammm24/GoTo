import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Phone, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmergencyStore } from '../../store/emergencyStore';
import toast from 'react-hot-toast';

export default function EmergencyContacts() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        relationship: '',
        priority: 1
    });

    const { contacts, fetchContacts, addContact, updateContact, deleteContact, isLoading } = useEmergencyStore();

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingContact) {
                await updateContact(editingContact._id, formData);
                toast.success('Contact updated successfully');
            } else {
                await addContact(formData);
                toast.success('Emergency contact added');
            }

            resetForm();
        } catch (error) {
            toast.error('Failed to save contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            phone: contact.phone,
            relationship: contact.relationship || '',
            priority: contact.priority || 1
        });
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await deleteContact(id);
            toast.success('Contact deleted');
        } catch (error) {
            toast.error('Failed to delete contact');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', relationship: '', priority: 1 });
        setEditingContact(null);
        setShowAddForm(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Shield className="mr-3 text-blue-600" size={32} />
                        Emergency Contacts
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Add trusted contacts who will be notified in emergencies
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-lg shadow-blue-500/30 flex items-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Add Contact</span>
                </button>
            </div>

            {/* Contacts List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                </div>
            ) : contacts.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <Shield size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Emergency Contacts</h3>
                    <p className="text-gray-600 mb-6">
                        Add emergency contacts to enhance your safety
                    </p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition"
                    >
                        Add Your First Contact
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {contacts.map((contact, index) => (
                            <motion.div
                                key={contact._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                        {/* Priority Badge */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${contact.priority === 1 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                contact.priority === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                                    'bg-gradient-to-r from-blue-500 to-blue-600'
                                            }`}>
                                            {contact.priority}
                                        </div>

                                        {/* Contact Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                                                {contact.relationship && (
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                                        {contact.relationship}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-4 mt-2 text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <Phone size={16} />
                                                    <span>{contact.phone}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <User size={16} />
                                                    <span className="text-sm">Priority {contact.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(contact)}
                                            className="p-3 hover:bg-blue-50 rounded-xl transition text-blue-600"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contact._id)}
                                            className="p-3 hover:bg-red-50 rounded-xl transition text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Relationship
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.relationship}
                                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Mother, Father, Spouse"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority (1-5)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Priority 1 contacts will be notified first in emergencies
                                    </p>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : editingContact ? 'Update' : 'Add Contact'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
