import { useEffect } from 'react';
import { useAuthStore } from '../store/index';

// Simple wrapper around zustand auth store for components/hooks
export const useAuth = () => {
	const { user, token, isLoading, error, login, register, logout, clearError } = useAuthStore();

	useEffect(() => clearError, [clearError]);

	const isAuthenticated = Boolean(token);

	return {
		user,
		token,
		isAuthenticated,
		isLoading,
		error,
		login,
		register,
		logout,
	};
};

export default useAuth;
