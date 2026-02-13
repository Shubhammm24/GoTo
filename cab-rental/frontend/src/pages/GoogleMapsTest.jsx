import { useEffect, useState } from 'react';

export default function GoogleMapsTest() {
    const [status, setStatus] = useState('Checking...');
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        setApiKey(key || 'NOT FOUND');

        if (!key) {
            setStatus('❌ API key not found in environment variables');
            return;
        }

        if (key.length < 30) {
            setStatus('❌ API key seems too short (should be 39+ characters)');
            return;
        }

        // Check if Google Maps is loaded
        if (window.google && window.google.maps) {
            setStatus('✅ Google Maps loaded successfully!');
        } else {
            setStatus('⏳ Waiting for Google Maps to load...');

            window.setTimeout(() => {
                if (window.google && window.google.maps) {
                    setStatus('✅ Google Maps loaded successfully!');
                } else {
                    setStatus('❌ Google Maps failed to load. Check console for errors.');
                }
            }, 3000);
        }
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-20">
            <h1 className="text-2xl font-bold mb-6">🗺️ Google Maps Diagnostic</h1>

            <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-sm font-medium text-blue-900 mb-2">Status:</div>
                    <div className="text-lg font-semibold text-blue-700">{status}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-sm font-medium text-gray-900 mb-2">API Key:</div>
                    <div className="text-xs font-mono break-all text-gray-700 bg-white p-3 rounded border">
                        {apiKey}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        Length: {apiKey.length} characters
                        {apiKey.startsWith('AIzaSy') && ' ✅ Starts with AIzaSy'}
                        {!apiKey.startsWith('AIzaSy') && apiKey !== 'NOT FOUND' && ' ⚠️ Does not start with AIzaSy'}
                    </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-900 mb-2">⚠️ Common Issues:</div>
                    <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                        <li>API key must start with "AIzaSy" (39+ characters)</li>
                        <li>Enable "Maps JavaScript API" in Google Cloud Console</li>
                        <li>Enable "Places API" for autocomplete</li>
                        <li>Enable "Directions API" for routes</li>
                        <li>Check API key restrictions (HTTP referrers)</li>
                        <li>Restart frontend after changing .env file</li>
                    </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-sm font-medium text-green-900 mb-2">✅ Next Steps:</div>
                    <ol className="text-xs text-green-800 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                        <li>Click "Credentials" → Find your API key</li>
                        <li>Copy the FULL key (should start with AIzaSy)</li>
                        <li>Paste in frontend/.env as: VITE_GOOGLE_MAPS_API_KEY=AIzaSy...</li>
                        <li>Restart frontend: npm run dev</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
