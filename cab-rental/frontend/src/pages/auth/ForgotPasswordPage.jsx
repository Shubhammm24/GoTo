import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Shield, CheckCircle, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/index';
import OtpInput from '../../components/OtpInput';

const STEPS = {
  EMAIL: 'email',
  OTP: 'otp',
  RESET: 'reset',
  SUCCESS: 'success',
};

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, isLoading } = useAuthStore();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [otpCode, setOtpCode] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      await forgotPassword(email);
      toast.success('Reset OTP sent to your email');
      setStep(STEPS.OTP);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleOtpComplete = useCallback((code) => {
    setOtpCode(code);
    setStep(STEPS.RESET);
  }, []);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      await resetPassword(otpCode, passwords.newPassword);
      toast.success('Password reset successfully!');
      setStep(STEPS.SUCCESS);
      setTimeout(() => navigate('/login'), 2500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
      // If OTP is invalid, go back to OTP step
      if (error.response?.data?.message?.includes('OTP')) {
        setStep(STEPS.OTP);
      }
    }
  };

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 map-grid-bg opacity-40" />
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-neon mb-4">
            <KeyRound size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">
            Reset <span className="text-primary">Password</span>
          </h1>
          <p className="text-white/40 mt-1 text-sm">
            {step === STEPS.EMAIL && "We'll send you a verification code"}
            {step === STEPS.OTP && 'Enter the code from your email'}
            {step === STEPS.RESET && 'Choose a strong new password'}
            {step === STEPS.SUCCESS && 'Your password has been updated'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-6">
          {['email', 'otp', 'reset', 'success'].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= ['email', 'otp', 'reset', 'success'].indexOf(step)
                  ? 'w-8 bg-primary'
                  : 'w-5 bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-glass overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: Email */}
            {step === STEPS.EMAIL && (
              <motion.form
                key="email"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleEmailSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-dark pl-11"
                      placeholder="your@email.com"
                      autoFocus
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      Send Reset Code
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* STEP 2: OTP */}
            {step === STEPS.OTP && (
              <motion.div
                key="otp"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Shield className="mx-auto text-primary mb-3" size={40} />
                <h2 className="text-lg font-bold text-white mb-1">Verification Code</h2>
                <p className="text-white/40 text-sm mb-6">
                  Sent to <span className="text-white/70 font-mono">{email}</span>
                </p>

                <OtpInput
                  length={6}
                  onComplete={handleOtpComplete}
                  disabled={isLoading}
                />

                {isLoading && (
                  <div className="flex justify-center mt-4">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}

                <button
                  onClick={() => setStep(STEPS.EMAIL)}
                  className="mt-6 flex items-center justify-center gap-1 text-white/30 hover:text-white/60 text-sm mx-auto transition-colors"
                >
                  <ArrowLeft size={14} />
                  Use different email
                </button>
              </motion.div>
            )}

            {/* STEP 3: New Password */}
            {step === STEPS.RESET && (
              <motion.form
                key="reset"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleResetSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      className="input-dark pl-11 pr-12"
                      placeholder="Min. 8 characters"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwords.newPassword && (
                    <div className="mt-2 flex gap-1">
                      {[
                        passwords.newPassword.length >= 8,
                        /[A-Z]/.test(passwords.newPassword),
                        /[a-z]/.test(passwords.newPassword),
                        /[0-9]/.test(passwords.newPassword),
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

                <div>
                  <label className="block text-sm font-semibold text-white/70 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="input-dark pl-11"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* STEP 4: Success */}
            {step === STEPS.SUCCESS && (
              <motion.div
                key="success"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
                <p className="text-white/40 text-sm mb-4">
                  Your password has been reset successfully.
                </p>
                <p className="text-white/30 text-xs">Redirecting to login...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to login */}
          {step !== STEPS.SUCCESS && (
            <>
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/30 text-xs">Remember your password?</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <Link
                to="/login"
                className="w-full btn-ghost flex items-center justify-center gap-2 py-3"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
