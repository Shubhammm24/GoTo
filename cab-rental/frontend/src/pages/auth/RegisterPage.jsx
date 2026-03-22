import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, UserCheck, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/index';
import OtpInput from '../../components/OtpInput';

const STEPS = {
  FORM: 'form',
  VERIFY: 'verify',
  SUCCESS: 'success',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp, isLoading, isEmailVerified, isPhoneVerified, pendingUserId, devOtps } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(STEPS.FORM);
  const [verifyingType, setVerifyingType] = useState('email'); // which OTP we're currently verifying
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Countdown timers for resend OTP
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('OTP sent to your email and phone!');
      setStep(STEPS.VERIFY);
      setVerifyingType('email');
      setEmailCountdown(60);
      setPhoneCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleOtpComplete = useCallback(async (code) => {
    try {
      const result = await verifyOtp(code, verifyingType);
      toast.success(`${verifyingType === 'email' ? 'Email' : 'Phone'} verified!`);

      if (result.isFullyVerified) {
        setStep(STEPS.SUCCESS);
        setTimeout(() => navigate('/login'), 2000);
      } else if (verifyingType === 'email' && !result.isPhoneVerified) {
        setVerifyingType('phone');
      } else if (verifyingType === 'phone' && !result.isEmailVerified) {
        setVerifyingType('email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    }
  }, [verifyOtp, verifyingType, navigate]);

  const handleResend = async (type) => {
    try {
      await resendOtp(type);
      toast.success(`OTP resent to your ${type}`);
      if (type === 'email') setEmailCountdown(60);
      else setPhoneCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const roles = [
    { value: 'customer', label: 'Customer', desc: 'Book rides & parcels', icon: '🧑' },
    { value: 'driver', label: 'Driver', desc: 'Drive & earn money', icon: '🚗' },
  ];

  const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 map-grid-bg opacity-40" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-neon mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white">
            Go<span className="text-primary">To</span>
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            {step === STEPS.FORM && 'Create your account to get started'}
            {step === STEPS.VERIFY && 'Verify your identity'}
            {step === STEPS.SUCCESS && 'You\'re all set!'}
          </p>
        </div>

        {/* Progress Indicator */}
        {step !== STEPS.FORM && (
          <div className="flex justify-center gap-2 mb-6">
            {['form', 'verify', 'success'].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= ['form', 'verify', 'success'].indexOf(step)
                    ? 'w-10 bg-primary'
                    : 'w-6 bg-white/10'
                }`}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-glass overflow-hidden">
          <AnimatePresence mode="wait" custom={step === STEPS.FORM ? -1 : 1}>
            {/* ─── STEP 1: Registration Form ─── */}
            {step === STEPS.FORM && (
              <motion.div
                key="form"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-dark pl-11"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-dark pl-11"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-dark pl-11"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-dark pl-11 pr-12"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Password strength indicators */}
                    {formData.password && (
                      <div className="mt-2 flex gap-1">
                        {[
                          formData.password.length >= 8,
                          /[A-Z]/.test(formData.password),
                          /[a-z]/.test(formData.password),
                          /[0-9]/.test(formData.password),
                        ].map((met, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              met ? 'bg-green-500' : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input-dark pl-11"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-white/20 bg-surface-2 accent-primary" />
                    <span className="text-xs text-white/40 leading-relaxed">
                      I agree to the{' '}
                      <a href="#" className="text-primary hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </span>
                  </label>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserCheck size={18} />
                        Create Account
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 2: OTP Verification ─── */}
            {step === STEPS.VERIFY && (
              <motion.div
                key="verify"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-center"
              >
                {/* Verification status pills */}
                <div className="flex justify-center gap-3 mb-6">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isEmailVerified
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                      : verifyingType === 'email'
                        ? 'bg-primary/15 text-primary border border-primary/30 animate-pulse'
                        : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {isEmailVerified ? <CheckCircle size={14} /> : <Mail size={14} />}
                    Email
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isPhoneVerified
                      ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                      : verifyingType === 'phone'
                        ? 'bg-primary/15 text-primary border border-primary/30 animate-pulse'
                        : 'bg-white/5 text-white/30 border border-white/10'
                  }`}>
                    {isPhoneVerified ? <CheckCircle size={14} /> : <Phone size={14} />}
                    Phone
                  </div>
                </div>

                <div className="mb-2">
                  <Shield className="mx-auto text-primary mb-3" size={40} />
                  <h2 className="text-xl font-bold text-white mb-1">
                    Verify Your {verifyingType === 'email' ? 'Email' : 'Phone'}
                  </h2>
                  <p className="text-white/40 text-sm">
                    Enter the 6-digit code sent to{' '}
                    <span className="text-white/70 font-mono">
                      {verifyingType === 'email' ? formData.email : formData.phone}
                    </span>
                  </p>
                </div>

                {/* Dev mode: show OTP codes on screen */}
                {devOtps && (
                  <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
                    <p className="text-yellow-400 text-xs font-bold mb-1">🔧 Dev Mode — Your OTP:</p>
                    <p className="text-yellow-300 text-2xl font-mono font-black tracking-widest">
                      {verifyingType === 'email' ? devOtps.emailOtp : devOtps.phoneOtp}
                    </p>
                  </div>
                )}

                <div className="my-6">
                  <OtpInput
                    key={verifyingType} // reset on type change
                    length={6}
                    onComplete={handleOtpComplete}
                    disabled={isLoading}
                  />
                </div>

                {isLoading && (
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}

                {/* Resend */}
                <div className="mt-4">
                  {(verifyingType === 'email' ? emailCountdown : phoneCountdown) > 0 ? (
                    <p className="text-white/30 text-sm">
                      Resend in{' '}
                      <span className="text-primary font-bold">
                        {verifyingType === 'email' ? emailCountdown : phoneCountdown}s
                      </span>
                    </p>
                  ) : (
                    <button
                      onClick={() => handleResend(verifyingType)}
                      disabled={isLoading}
                      className="text-primary hover:text-primary-dark text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {/* Back button */}
                <button
                  onClick={() => setStep(STEPS.FORM)}
                  className="mt-6 flex items-center justify-center gap-1 text-white/30 hover:text-white/60 text-sm mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to form
                </button>
              </motion.div>
            )}

            {/* ─── STEP 3: Success ─── */}
            {step === STEPS.SUCCESS && (
              <motion.div
                key="success"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                custom={1}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Verified!</h2>
                <p className="text-white/40 text-sm mb-6">
                  Your account has been created and verified successfully.
                </p>
                <p className="text-white/30 text-xs">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer links (only on form step) */}
          {step === STEPS.FORM && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs">Already have an account?</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <Link
                to="/login"
                className="w-full btn-ghost flex items-center justify-center gap-2 py-3"
              >
                Sign In Instead
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
