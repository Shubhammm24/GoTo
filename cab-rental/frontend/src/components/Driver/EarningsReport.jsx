import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const EarningsReport = () => {
	const [rows, setRows] = useState([]);
	const [summary, setSummary] = useState({ week: 0, month: 0, pending: 0 });

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data } = await api.get('/drivers/earnings/history');
				setRows(data?.records || []);
				setSummary({
					week: data?.week || 0,
					month: data?.month || 0,
					pending: data?.pending || 0,
				});
			} catch (err) {
				// best-effort; toast inside page if needed
			}
		};
		fetchData();
	}, []);

	return (
		<div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{[
					{ label: 'This Week', value: summary.week },
					{ label: 'This Month', value: summary.month },
					{ label: 'Pending Payout', value: summary.pending },
				].map((card) => (
					<div key={card.label} className="p-4 bg-gray-50 rounded-xl">
						<p className="text-xs text-gray-500">{card.label}</p>
						<p className="text-xl font-bold text-gray-900">{formatCurrency(card.value)}</p>
					</div>
				))}
			</div>

			<div className="overflow-auto">
				<table className="min-w-full text-sm">
					<thead>
						<tr className="text-left text-gray-500">
							<th className="py-2 pr-4">Date</th>
							<th className="py-2 pr-4">Trip</th>
							<th className="py-2 pr-4">Earning</th>
							<th className="py-2 pr-4">Status</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row._id} className="border-t border-gray-100">
								<td className="py-2 pr-4">{formatDate(row.date)}</td>
								<td className="py-2 pr-4">#{row.booking?.slice(-6)}</td>
								<td className="py-2 pr-4 font-semibold text-green-600">{formatCurrency(row.amount)}</td>
								<td className="py-2 pr-4 capitalize">{row.status}</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={4} className="py-4 text-center text-gray-500">
									No earnings recorded yet
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default EarningsReport;
