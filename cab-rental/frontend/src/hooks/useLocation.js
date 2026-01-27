import { useEffect, useState, useCallback } from 'react';
import { getCurrentPosition, watchPosition, stopWatch } from '../services/mapService';

export const useLocation = () => {
	const [coords, setCoords] = useState(null); // [lng, lat]
	const [error, setError] = useState(null);
	const [watchId, setWatchId] = useState(null);

	const fetchCurrent = useCallback(async () => {
		try {
			const position = await getCurrentPosition();
			setCoords(position);
		} catch (err) {
			setError(err.message || 'Unable to fetch location');
		}
	}, []);

	const startWatch = useCallback(() => {
		const id = watchPosition((pos) => setCoords(pos));
		setWatchId(id);
	}, []);

	const stopWatching = useCallback(() => {
		stopWatch(watchId);
		setWatchId(null);
	}, [watchId]);

	useEffect(() => {
		fetchCurrent();
		return () => stopWatch(watchId);
	}, [fetchCurrent, watchId]);

	return {
		coords,
		error,
		fetchCurrent,
		startWatch,
		stopWatching,
	};
};

export default useLocation;
