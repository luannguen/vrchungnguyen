import { useState } from 'react';
import { authService } from '../../services/authService';
import { UserDTO } from '../../components/data/types';

export function useAuthFeature() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await authService.login(email, password);
            if (!result.success) {
                setError(result.error);
                return null;
            }
            return result.data;
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        logout,
        isLoading,
        error
    };
}
