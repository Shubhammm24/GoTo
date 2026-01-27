import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Wallet = () => {
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState([]);

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get('/payments/wallet');
				setBalance(data?.balance || 0);
				setTransactions(data?.transactions || []);
			} catch (err) {
				// best-effort
			}
		};
		load();
	}, []);

	return (
		<div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-500">Wallet balance</p>
					<p className="text-3xl font-bold text-gray-900">{formatCurrency(balance)}</p>
				</div>
				<button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold">Add money</button>
			</div>

			<div className="space-y-3">
				{transactions.map((txn) => (
					<div key={txn._id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
						<div>
							<p className="font-semibold text-gray-900">{txn.type === 'debit' ? 'Ride payment' : 'Top-up'}</p>
							<p className="text-xs text-gray-500">{formatDate(txn.date)}</p>
						</div>
						<p className={`font-bold ${txn.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
							{txn.type === 'debit' ? '-' : '+'}
							{formatCurrency(txn.amount)}
						</p>
					</div>
				))}
				{transactions.length === 0 && <p className="text-sm text-gray-500">No transactions yet</p>}
			</div>
		</div>
	);
};

export default Wallet;
