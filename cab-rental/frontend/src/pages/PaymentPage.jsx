import { motion } from 'framer-motion';
import { CreditCard, CheckCircle } from 'lucide-react';

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-soft p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="text-green-600" size={40} />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment</h1>
            <p className="text-xl text-gray-600">Choose your payment method</p>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Credit/Debit Card', icon: '💳', color: 'blue' },
              { name: 'Digital Wallet', icon: '📱', color: 'green' },
              { name: 'Bank Transfer', icon: '🏦', color: 'purple' },
              { name: 'Cash', icon: '💵', color: 'yellow' },
            ].map((method, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{method.icon}</span>
                  <span className="font-bold text-gray-900">{method.name}</span>
                </div>
                <CreditCard className="text-gray-400" size={20} />
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-shadow"
          >
            Complete Payment
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
