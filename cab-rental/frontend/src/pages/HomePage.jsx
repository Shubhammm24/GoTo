import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Clock, Star, Zap, Package, Car, MapPin, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/index';

const HomePage = () => {
  const { token } = useAuthStore();
  const [activeService, setActiveService] = useState('ride');

  const services = [
    { id: 'ride', icon: <Car size={28} />, label: 'RIDE', sub: '4 min away' },
    { id: 'self-drive', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>, label: 'SELF DRIVE', sub: 'Find cars' },
    { id: 'parcel', icon: <Package size={28} />, label: 'PARCEL', sub: 'Send item' },
    { id: 'business', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>, label: 'BUSINESS', sub: 'Manage trips' },
  ];

  const features = [
    { icon: <Shield size={22} />, title: 'Safety Shield', description: 'Real-time SOS, emergency contacts & live location sharing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: <Zap size={22} />, title: 'Instant Booking', description: 'Book a ride in seconds with smart fare estimation', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { icon: <MapPin size={22} />, title: 'Live Tracking', description: 'Real-time GPS tracking of your driver on the map', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { icon: <Star size={22} />, title: 'Verified Drivers', description: 'Background-checked, rated drivers you can trust', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { icon: <Clock size={22} />, title: 'Scheduled Rides', description: 'Plan ahead and schedule rides up to 7 days in advance', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: <Package size={22} />, title: 'Parcel Delivery', description: 'Send packages across the city with real-time tracking', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  ];

  const steps = [
    { number: '01', icon: '📍', title: 'Set Location', desc: 'Enter your pickup and destination' },
    { number: '02', icon: '🚗', title: 'Choose Ride', desc: 'Pick from Bike, Sedan, EV or SUV' },
    { number: '03', icon: '💳', title: 'Pay Securely', desc: 'UPI, card or cash — your choice' },
    { number: '04', icon: '✨', title: 'Enjoy Ride', desc: 'Track your driver in real-time' },
  ];

  return (
    <div className="w-full">

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-bg-dark flex flex-col">

        {/* Map-style background */}
        <div className="absolute inset-0 map-grid-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-dark" />

        {/* Simulated road lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute h-px bg-white/5 w-full" style={{ top: '30%' }} />
          <div className="absolute h-[2px] bg-white/6 w-full" style={{ top: '55%' }} />
          <div className="absolute h-px bg-white/5 w-full" style={{ top: '75%' }} />
          <div className="absolute w-px bg-white/5 h-full" style={{ left: '25%' }} />
          <div className="absolute w-[2px] bg-white/6 h-full" style={{ left: '50%' }} />
          <div className="absolute w-px bg-white/5 h-full" style={{ left: '75%' }} />
        </div>

        {/* Live driver markers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="live-marker" style={{ top: '32%', left: '22%' }} />
          <div className="live-marker" style={{ top: '48%', left: '40%' }} />
          <div className="live-marker" style={{ top: '28%', left: '62%' }} />
          <div className="live-marker" style={{ top: '60%', left: '70%' }} />
          <div className="live-marker" style={{ top: '42%', left: '82%' }} />
        </div>

        {/* Route SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
          <path d="M 200 55% Q 40% 45% 50% 30% T 80% 28%" fill="none" stroke="#f97415" strokeWidth="2.5" strokeDasharray="8 4" strokeLinecap="round" />
        </svg>

        {/* Destination pin */}
        <div className="absolute hidden md:flex flex-col items-center" style={{ top: '26%', left: '80%', transform: 'translate(-50%, -100%)' }}>
          <div className="bg-white text-bg-dark text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg mb-1.5 whitespace-nowrap">Skyline Tower</div>
          <div className="w-3 h-3 bg-primary rounded-full shadow-neon-sm" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-between px-6 md:px-10 lg:px-16 py-12 max-w-7xl mx-auto w-full">

          {/* Top: Headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            {/* Nearby badge */}
            <div className="inline-flex items-center gap-2 glass-card px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">5 drivers nearby</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
              Your City,<br />
              <span className="text-primary">Your Ride.</span>
            </h1>
            <p className="text-white/50 text-lg mb-8 leading-relaxed">
              Book rides, send parcels, or rent a car — all in one place. Real-time tracking, verified drivers, and instant booking.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {token ? (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to={activeService === 'parcel' ? '/parcel' : '/booking'}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {activeService === 'parcel' ? 'Send a Parcel' : 'Book a Ride'}
                    <ChevronRight size={18} />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                      Get Started Free
                      <ChevronRight size={18} />
                    </Link>
                  </motion.div>
                  <Link to="/login" className="btn-ghost inline-flex items-center gap-2">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Bottom: Service Tabs Dock */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-auto"
          >
            <div className="glass-card rounded-2xl p-2 flex items-center gap-1 overflow-x-auto max-w-2xl">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setActiveService(svc.id)}
                  className={`flex-1 min-w-[100px] relative flex flex-col items-center justify-center py-4 px-3 rounded-xl transition-all duration-200 ${activeService === svc.id
                    ? 'bg-primary/15'
                    : 'hover:bg-white/5'
                    }`}
                >
                  {activeService === svc.id && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-neon-sm" />
                  )}
                  <span className={`mb-2 transition-colors ${activeService === svc.id ? 'text-primary' : 'text-white/40'}`}>
                    {svc.icon}
                  </span>
                  <span className={`text-xs font-bold tracking-wide ${activeService === svc.id ? 'text-white' : 'text-white/40'}`}>
                    {svc.label}
                  </span>
                  <span className="text-[10px] text-white/30 mt-0.5">{svc.sub}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────── */}
      <section className="py-24 bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-3 block">Why GoTo</span>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need, built in</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              From instant booking to real-time safety features — GoTo has you covered every step of the journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className={`glass-card rounded-2xl p-6 border ${feature.bg} transition-all duration-300 cursor-default`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-24 bg-bg-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-widest uppercase mb-3 block">Simple Process</span>
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-white/50 text-lg">Book your perfect ride in 4 easy steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="glass-card rounded-2xl p-7 text-center h-full border border-white/5 hover:border-primary/30 transition-all duration-300">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="text-5xl font-black text-primary/10 mb-3 leading-none">{step.number}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-white/40 text-sm">{step.desc}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 w-6 h-6 items-center justify-center">
                    <ChevronRight size={20} className="text-primary/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ───────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="absolute inset-0 map-grid-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to <span className="text-primary">GoTo</span>?
            </h2>
            <p className="text-white/50 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of riders enjoying safe, affordable, and comfortable rides every day.
            </p>
            {!token && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                    Create Free Account
                    <ChevronRight size={20} />
                  </Link>
                </motion.div>
                <Link to="/login" className="btn-ghost inline-flex items-center gap-2 text-base px-8 py-4">
                  Sign In Instead
                </Link>
              </div>
            )}
            {token && (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/booking" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                  Book a Ride Now
                  <ChevronRight size={20} />
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
