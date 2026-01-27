import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState({ backend: 'testing', message: '' });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus({ backend: 'testing', message: 'Testing connection...' });
    
    try {
      // Test backend connection
      const response = await api.get('/');
      
      if (response.status === 200) {
        setStatus({ 
          backend: 'connected', 
          message: 'Backend connected successfully!',
          data: response.data 
        });
      }
    } catch (error) {
      setStatus({ 
        backend: 'error', 
        message: error.message || 'Failed to connect to backend',
        error: error.response?.data || error.message
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md z-50 border-2">
      <div className="flex items-start space-x-3">
        {status.backend === 'testing' && (
          <Loader2 className="animate-spin text-blue-500 mt-1" size={20} />
        )}
        {status.backend === 'connected' && (
          <CheckCircle className="text-green-500 mt-1" size={20} />
        )}
        {status.backend === 'error' && (
          <XCircle className="text-red-500 mt-1" size={20} />
        )}
        
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {status.backend === 'testing' && 'Testing Connection...'}
            {status.backend === 'connected' && 'Connected ✓'}
            {status.backend === 'error' && 'Connection Failed'}
          </p>
          <p className="text-sm text-gray-600 mt-1">{status.message}</p>
          
          {status.backend === 'connected' && status.data && (
            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
              <p className="font-semibold text-green-800">Backend Response:</p>
              <pre className="mt-1 text-green-700 overflow-x-auto">
                {JSON.stringify(status.data, null, 2)}
              </pre>
            </div>
          )}
          
          {status.backend === 'error' && status.error && (
            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
              <p className="font-semibold text-red-800">Error Details:</p>
              <pre className="mt-1 text-red-700 overflow-x-auto">
                {JSON.stringify(status.error, null, 2)}
              </pre>
            </div>
          )}
          
          <button
            onClick={testConnection}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
