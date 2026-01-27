import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

const AdminDashboard = () => {
  const [pendingApprovals] = useState([
    {
      id: 1,
      type: 'driver',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 9876543210',
      appliedDate: '2024-01-15',
      documents: ['License', 'Insurance', 'Police Clearance'],
      avatar: '👨',
    },
    {
      id: 2,
      type: 'vehicle',
      owner: 'Priya Singh',
      vehicleModel: 'Toyota Innova',
      licensePlate: 'DL-01-AB-1234',
      year: 2023,
      appliedDate: '2024-01-14',
      avatar: '🚗',
    },
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform management and analytics</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: 'Total Users', value: '2,345', icon: Users, color: 'blue' },
            { label: 'Total Bookings', value: '8,921', icon: TrendingUp, color: 'green' },
            { label: 'Total Revenue', value: '₹42,50,000', icon: DollarSign, color: 'purple' },
            { label: 'Pending Approvals', value: '12', icon: Clock, color: 'orange' },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className={`bg-white rounded-2xl shadow-soft p-6 border-l-4 border-${metric.color}-500`}
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-gray-600 text-sm font-bold">{metric.label}</p>
                <metric.icon className={`text-${metric.color}-600`} size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pending Driver Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-soft p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Driver Approvals</h2>

          <div className="space-y-4">
            {pendingApprovals
              .filter((a) => a.type === 'driver')
              .map((approval) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{approval.avatar}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{approval.name}</p>
                        <p className="text-sm text-gray-600">{approval.email}</p>
                        <p className="text-sm text-gray-600">{approval.phone}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Applied: {new Date(approval.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Approve</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center space-x-2"
                      >
                        <XCircle size={18} />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="pt-4 border-t border-orange-200">
                    <p className="text-sm font-bold text-gray-900 mb-2">Submitted Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      {approval.documents.map((doc) => (
                        <span
                          key={doc}
                          className="px-3 py-1 bg-white border border-orange-300 rounded-full text-sm text-gray-700"
                        >
                          ✓ {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Pending Vehicle Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Vehicle Approvals</h2>

          <div className="space-y-4">
            {pendingApprovals
              .filter((a) => a.type === 'vehicle')
              .map((approval) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{approval.avatar}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{approval.vehicleModel}</p>
                        <p className="text-sm text-gray-600">License Plate: {approval.licensePlate}</p>
                        <p className="text-sm text-gray-600">Owner: {approval.owner}</p>
                        <p className="text-sm text-gray-600">Year: {approval.year}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Applied: {new Date(approval.appliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Approve</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center space-x-2"
                      >
                        <XCircle size={18} />
                        <span>Reject</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
