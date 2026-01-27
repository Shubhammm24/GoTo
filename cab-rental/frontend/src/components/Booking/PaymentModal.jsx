import { useState } from 'react';
import { CreditCard, Wallet, Smartphone, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePaymentStore } from '../../store/index';
import { PAYMENT_METHODS } from '../../utils/constants';

const icons = {
	card: CreditCard,
	wallet: Wallet,
	upi: Smartphone,
	cash: DollarSign,
};

const PaymentModal = ({ amount, bookingId, onClose, onPaid }) => {
	const { createPayment, isLoading } = usePaymentStore();
	const [method, setMethod] = useState('card');
	const [reference, setReference] = useState('');

	const pay = async () => {
		try {
			const payment = await createPayment({
				booking: bookingId,
				amount,
				method,
				reference,
				status: method === 'cash' ? 'pending' : 'completed',
			});
			toast.success('Payment created');
			onPaid?.(payment);
			onClose?.();
		} catch (err) {
			toast.error(err.response?.data?.message || 'Payment failed');
		}
	};

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
			<div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<p className="text-sm text-gray-500">Amount</p>
						<p className="text-2xl font-bold text-gray-900">₹{Number(amount || 0).toFixed(0)}</p>
					</div>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-600">
						<X size={20} />
					</button>
				</div>

				<div className="grid grid-cols-2 gap-3 mb-4">
					{PAYMENT_METHODS.map((m) => {
						const Icon = icons[m] || CreditCard;
						return (
							<button
								key={m}
								type="button"
								onClick={() => setMethod(m)}
								className={`p-3 border-2 rounded-xl flex items-center space-x-3 transition ${
									method === m ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
								}`}
							>
								<Icon size={18} />
								<span className="font-semibold capitalize">{m}</span>
							</button>
						);
					})}
				</div>

				{method !== 'cash' && (
					<div className="mb-4">
						<label className="block text-sm font-semibold text-gray-700 mb-1">Reference / UPI ID</label>
						<input
							value={reference}
							onChange={(e) => setReference(e.target.value)}
							className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500"
							placeholder="Transaction ID or UPI"
						/>
					</div>
				)}

				<button
					type="button"
					disabled={isLoading}
					onClick={pay}
					className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
				>
					{isLoading ? 'Processing...' : 'Confirm payment'}
				</button>
			</div>
		</div>
	);
};

export default PaymentModal;
