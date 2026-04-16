import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, UserCheck, CheckCircle, Shield, Car, Users } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/index';
import OtpInput from '../../components/OtpInput';

const STEPS = {
  ROLE: 'role',
  FORM: 'form',
  VERIFY: 'verify',
  SUCCESS: 'success',
};

const ROLES = [
  {
    id: 'customer',
    label: 'Customer',
    desc: 'Book rides, send parcels & track deliveries',
    icon: Users,
    emoji: '🧑',
    gradient: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
  },
  {
    id: 'driver',
    label: 'Driver',
    desc: 'Drive vehicles, earn money & manage rides',
    icon: Car,
    emoji: '🚗',
    gradient: 'from-green-500 to-emerald-500',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
  },
];

const ROLE_DASHBOARD = {
  customer: '/dashboard/user',
  driver: '/dashboard/driver',
  admin: '/dashboard/admin',
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp, googleLogin, isLoading, isEmailVerified, isPhoneVerified, pendingUserId, devOtps } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(STEPS.ROLE);
  const [selectedRole, setSelectedRole] = useState(null);
  const [verifyingType, setVerifyingType] = useState('email');
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  const [pendingGoogleRole, setPendingGoogleRole] = useState(null);
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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(STEPS.FORM);
  };

  // Google sign-up handler — takes a role param
  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const role = pendingGoogleRole || selectedRole || 'customer';
      try {
        const result = await googleLogin(tokenResponse.access_token, role);
        const userRole = result.user?.role;
        toast.success(`Account created! Welcome, ${result.user?.name?.split(' ')[0] || 'there'}! 🎉`);
        navigate(ROLE_DASHBOARD[userRole] || '/');
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Google sign-up failed');
      }
    },
    onError: (err) => {
      console.error('Google signup error:', err);
      toast.error('Google sign-up was cancelled or failed');
    },
    flow: 'implicit',
  });

  const triggerGoogleSignup = (role) => {
    setPendingGoogleRole(role);
    // Need a tick for state to update before opening popup
    setTimeout(() => handleGoogleSignup(), 50);
  };

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
      await register({ ...registerData, role: selectedRole });
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

  const currentRoleConfig = ROLES.find(r => r.id === selectedRole);

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
            {step === STEPS.ROLE && 'Choose how you want to use GoTo'}
            {step === STEPS.FORM && `Create your ${currentRoleConfig?.label || ''} account`}
            {step === STEPS.VERIFY && 'Verify your identity'}
            {step === STEPS.SUCCESS && "You're all set!"}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {['role', 'form', 'verify', 'success'].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= ['role', 'form', 'verify', 'success'].indexOf(step)
                  ? 'w-10 bg-primary'
                  : 'w-6 bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8 shadow-glass overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ─── STEP 0: Role Selection ─── */}
            {step === STEPS.ROLE && (
              <motion.div
                key="role"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <h2 className="text-lg font-bold text-white text-center mb-5">I want to join as a...</h2>
                <div className="space-y-3">
                  {ROLES.map((role, i) => (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`w-full group relative overflow-hidden rounded-2xl border ${role.border} ${role.bg} p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center text-2xl`}>
                          {role.emoji}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${role.text} text-base`}>{role.label}</p>
                          <p className="text-white/40 text-xs mt-0.5">{role.desc}</p>
                        </div>
                        <ArrowRight size={18} className={`${role.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Google sign-up from role step */}
                <div className="mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs">or sign up with Google</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  {ROLES.map((role) => (
                    <motion.button
                      key={`google-${role.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => triggerGoogleSignup(role.id)}
                      disabled={isLoading}
                      className={`w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue as {role.label} with Google
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ─── STEP 1: Registration Form ─── */}
            {step === STEPS.FORM && (
              <motion.div
                key="form"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {/* Role badge */}
                {currentRoleConfig && (
                  <div className="flex justify-center mb-5">
                    <button
                      onClick={() => setStep(STEPS.ROLE)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentRoleConfig.bg} border ${currentRoleConfig.border} transition-all hover:opacity-80`}
                    >
                      <span className="text-sm">{currentRoleConfig.emoji}</span>
                      <span className={`text-xs font-bold ${currentRoleConfig.text}`}>{currentRoleConfig.label}</span>
                      <span className="text-white/30 text-[10px]">· tap to change</span>
                    </button>
                  </div>
                )}

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
                        Create {currentRoleConfig?.label} Account
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Google sign-up from form step */}
                <div className="mt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/30 text-xs">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => triggerGoogleSignup(selectedRole || 'customer')}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign up as {currentRoleConfig?.label} with Google
                  </motion.button>
                </div>

                <button
                  onClick={() => setStep(STEPS.ROLE)}
                  className="mt-4 flex items-center justify-center gap-1 text-white/30 hover:text-white/60 text-sm mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  Change role
                </button>
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
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="text-center"
              >
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
                    key={verifyingType}
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
                  Your {currentRoleConfig?.label.toLowerCase()} account has been created and verified.
                </p>
                <p className="text-white/30 text-xs">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer links */}
          {(step === STEPS.ROLE || step === STEPS.FORM) && (
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
