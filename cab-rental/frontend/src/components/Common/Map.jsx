import { MapPin } from 'lucide-react';

const Map = ({ height = '16rem', markerLabel = 'Pickup', address }) => {
	return (
		<div
			className="w-full rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center"
			style={{ height }}
		>
			<div className="text-center text-gray-700">
				<div className="flex items-center justify-center space-x-2 mb-2 text-blue-600">
					<MapPin />
					<span className="font-semibold">{markerLabel}</span>
				</div>
				<p className="text-sm max-w-sm">{address || 'Map preview placeholder – connect map SDK to render tiles'}</p>
			</div>
		</div>
	);
};

export default Map;
