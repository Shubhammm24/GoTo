import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const KYC = () => {
	const [docs, setDocs] = useState({ license: null, idProof: null, insurance: null });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [status, setStatus] = useState(null);

	const handleFile = (e, key) => {
		setDocs((prev) => ({ ...prev, [key]: e.target.files[0] }));
	};

	const submitKyc = async (e) => {
		e.preventDefault();
		if (!docs.license || !docs.idProof) {
			toast.error('License and ID proof are required');
			return;
		}
		setIsSubmitting(true);
		try {
			const form = new FormData();
			Object.entries(docs).forEach(([key, file]) => file && form.append(key, file));
			const { data } = await api.post('/drivers/kyc', form, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			setStatus(data?.status || 'submitted');
			toast.success('KYC submitted');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Failed to submit KYC');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-soft p-6">
			<div className="flex items-center space-x-3 mb-4">
				<UploadCloud className="text-blue-600" size={24} />
				<div>
					<h3 className="text-xl font-bold text-gray-900">Driver KYC</h3>
					<p className="text-sm text-gray-600">Upload required documents for verification</p>
				</div>
			</div>

			<form onSubmit={submitKyc} className="space-y-4">
				{[{ key: 'license', label: 'Driving License' }, { key: 'idProof', label: 'ID Proof' }, { key: 'insurance', label: 'Vehicle Insurance (optional)' }].map(
					(item) => (
						<div key={item.key} className="border-2 border-dashed border-gray-200 rounded-lg p-4">
							<label className="flex items-center space-x-3 cursor-pointer">
								<FileText className="text-gray-500" size={20} />
								<div className="flex-1">
									<p className="font-semibold text-gray-900">{item.label}</p>
									<p className="text-xs text-gray-500">PDF or image files</p>
								</div>
								<input type="file" className="hidden" onChange={(e) => handleFile(e, item.key)} />
								<span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm">Choose file</span>
							</label>
							{docs[item.key] && <p className="text-xs text-green-600 mt-2">{docs[item.key].name}</p>}
						</div>
					)
				)}

				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
				>
					{isSubmitting ? 'Submitting...' : 'Submit KYC'}
				</button>

				{status && (
					<div className="flex items-center space-x-2 text-green-600 text-sm">
						<CheckCircle size={18} />
						<span>Status: {status}</span>
					</div>
				)}
			</form>
		</div>
	);
};

export default KYC;
