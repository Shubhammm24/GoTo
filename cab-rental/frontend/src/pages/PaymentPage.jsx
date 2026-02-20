import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Loader2, AlertCircle, IndianRupee,
  MapPin, Car, Calendar, ArrowLeft
} from 'lucide-react';
import { bookingsAPI, paymentsAPI } from '../services/api';
import { useAuthStore } from '../store/index';
import toast from 'react-hot-toast';

/* ─── Load Razorpay script dynamically ──────────────────────── */
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);
  const [payMethod, setPayMethod] = useState('online'); // 'online' | 'cod'

  /* ── Fetch booking ─────────────────────────────────────────── */
  useEffect(() => {
    if (!bookingId) { setError('No booking ID provided'); setLoading(false); return; }
    bookingsAPI.getById(bookingId)
      .then(res => setBooking(res.data?.booking || res.data))
      .catch(() => setError('Booking not found'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  /* ── Online / Razorpay payment ─────────────────────────────── */
  const handlePayOnline = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const orderRes = await paymentsAPI.createOrder({
        bookingId: booking._id,
        amount: booking.totalAmount,
      });

      // Dev mode — payment auto-completed by backend
      if (orderRes.data.devMode) {
        setPaid(true);
        toast.success('Payment completed (dev mode) 🎉');
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load'); setPaying(false); return; }

      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'GoTo Cab Rental',
        description: `Booking #${booking._id?.slice(-6).toUpperCase()}`,
        order_id: orderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#f97415' },
        handler: async (response) => {
          try {
            await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaid(true);
            toast.success('Payment successful! 🎉');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => { setPaying(false); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed');
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to initiate payment');
      setPaying(false);
    }
  };

  /* ── COD payment ───────────────────────────────────────────── */
  const handlePayCOD = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      await paymentsAPI.cod({
        bookingId: booking._id,
        amount: booking.totalAmount,
      });
      setPaid(true);
      toast.success('Booking confirmed — pay in cash! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to confirm COD booking');
      setPaying(false);
    }
  };

  const handlePay = () => payMethod === 'cod' ? handlePayCOD() : handlePayOnline();

  /* ── Success screen ────────────────────────────────────────── */
  if (paid) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 border border-green-500/20 text-center max-w-sm w-full"
          style={{ background: 'rgba(17,24,39,0.9)', backdropFilter: 'blur(20px)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-400" />
          </motion.div>
          <h1 className="text-white text-2xl font-bold mb-2">
            {payMethod === 'cod' ? 'Booking Confirmed!' : 'Payment Successful!'}
          </h1>
          <p className="text-white/50 text-sm mb-6">
            {payMethod === 'cod'
              ? 'Pay the driver in cash at pickup. Have a great ride!'
              : 'Your booking is confirmed. Have a great ride!'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/history')}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:border-white/20 transition-all">
              View History
            </button>
            <button onClick={() => navigate(`/tracking/${bookingId}`)}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all">
              Track Ride
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    );
  }

  /* ── Error ─────────────────────────────────────────────────── */
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center px-4">
        <div className="rounded-2xl p-6 border border-red-500/20 bg-red-500/5 text-center max-w-sm w-full">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Something went wrong</p>
          <p className="text-white/40 text-sm mb-4">{error || 'Booking not found'}</p>
          <button onClick={() => navigate('/booking')}
            className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold">
            Back to Booking
          </button>
        </div>
      </div>
    );
  }

  /* ── Main UI ───────────────────────────────────────────────── */
  const rentalType = booking.rentalType === 'self-drive' ? 'Self-Drive' : 'Driver Operated';

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <div className="sticky top-16 z-20 border-b border-white/10"
        style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-white font-bold text-sm">Complete Payment</h1>
            <p className="text-white/40 text-xs">Booking #{booking._id?.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Booking Summary Card */}
        <div className="rounded-2xl p-5 border border-white/10"
          style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-4">Booking Summary</p>

          {/* Type + Vehicle */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Car size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{rentalType} · {booking.vehicleType}</p>
              <p className="text-white/40 text-xs capitalize">{booking.status}</p>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-start gap-2 mb-4">
            <div className="flex flex-col items-center mt-1 gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <div className="w-px h-6 bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-white/70 text-xs">{booking.pickupLocation?.address || 'Pickup'}</p>
              </div>
              <div>
                <p className="text-white/70 text-xs">
                  {booking.dropoffLocation?.address || (booking.rentalType === 'self-drive' ? 'Self-drive — no fixed dropoff' : 'Dropoff')}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-sm">Total Amount</p>
              <div className="flex items-center gap-1 text-white text-xl font-bold">
                <IndianRupee size={16} />
                {booking.totalAmount?.toLocaleString('en-IN')}
              </div>
            </div>
            <p className="text-white/30 text-[10px] mt-1">Inclusive of all taxes and GST</p>
          </div>
        </div>

        {/* ── Payment Method Selection ────────────────────────── */}
        <div className="rounded-2xl p-4 border border-white/10"
          style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(20px)' }}>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">Choose Payment Method</p>

          <div className="space-y-2">
            {/* Online Payment Option */}
            <button
              onClick={() => setPayMethod('online')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${payMethod === 'online'
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-white/10 hover:border-white/20'
                }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payMethod === 'online' ? 'border-primary' : 'border-white/30'
                }`}>
                {payMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${payMethod === 'online' ? 'text-white' : 'text-white/60'}`}>
                  Pay Online
                </p>
                <p className="text-white/30 text-[10px]">Card · UPI · Net Banking via Razorpay</p>
              </div>
              <div className="flex gap-1.5">
                <span className="text-xs">💳</span>
                <span className="text-xs">📱</span>
                <span className="text-xs">🏦</span>
              </div>
            </button>

            {/* COD Option */}
            <button
              onClick={() => setPayMethod('cod')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${payMethod === 'cod'
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-white/10 hover:border-white/20'
                }`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payMethod === 'cod' ? 'border-green-500' : 'border-white/30'
                }`}>
                {payMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-semibold ${payMethod === 'cod' ? 'text-white' : 'text-white/60'}`}>
                  Cash on Delivery
                </p>
                <p className="text-white/30 text-[10px]">Pay the driver in cash at pickup</p>
              </div>
              <span className="text-lg">💵</span>
            </button>
          </div>
        </div>

        {/* Pay Button */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={handlePay}
          disabled={paying}
          className={`w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-neon disabled:opacity-60 transition-all ${payMethod === 'cod' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary'
            }`}>
          {paying ? (
            <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : payMethod === 'cod' ? (
            <>💵 Confirm — Pay ₹{booking.totalAmount?.toLocaleString('en-IN')} in Cash</>
          ) : (
            <><IndianRupee size={16} /> Pay ₹{booking.totalAmount?.toLocaleString('en-IN')}</>
          )}
        </motion.button>

        <p className="text-center text-white/30 text-xs">
          By proceeding, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
