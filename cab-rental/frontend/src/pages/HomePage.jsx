import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Shield, Users, Zap } from 'lucide-react';
import { useAuthStore } from '../store/index';

const HomePage = () => {
  const { token } = useAuthStore();
  const [email, setEmail] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  const features = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Affordable Pricing',
      description: 'Transparent pricing with no hidden charges',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Booking',
      description: 'Book your ride in seconds',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'Your safety is our priority',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Verified Drivers',
      description: 'All drivers are background checked',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time Tracking',
      description: 'Track your ride in real-time',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Excellent Support',
      description: '24/7 customer support',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full"
          >
            {/* Left Content */}
            <motion.div variants={itemVariants} className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your Journey, Our Priority
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Experience seamless, safe, and affordable ride-sharing with GoTo Cab. 
                Book, ride, and arrive with confidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {token ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/booking"
                      className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-center hover:shadow-lg transition-shadow"
                    >
                      Book a Ride Now
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/register"
                        className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-center hover:shadow-lg transition-shadow"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/login"
                        className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-center hover:bg-white hover:text-blue-600 transition-all"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              variants={itemVariants}
              className="relative h-96 lg:h-full flex items-center justify-center"
            >
              <div className="text-9xl animate-bounce">🚕</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose GoTo Cab?</h2>
            <p className="text-xl text-gray-600">Experience the best ride-sharing service with these premium features</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all cursor-pointer card-hover"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to book your perfect ride</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { number: '1', title: 'Open App', icon: '📱' },
              { number: '2', title: 'Enter Location', icon: '📍' },
              { number: '3', title: 'Select Ride', icon: '🚗' },
              { number: '4', title: 'Enjoy Ride', icon: '✨' },
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 text-center h-full card-hover">
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <div className="text-5xl font-bold text-blue-600 mb-4 opacity-20">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="text-3xl text-blue-300">→</div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Ride?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users enjoying affordable, safe, and comfortable rides every day.
            </p>

            {!token && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:shadow-xl transition-shadow"
                >
                  Create Your Account
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
