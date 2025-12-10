import { useState } from 'react';
import { authService } from '../../services/authService';
// import { UserDTO } from '../../components/data/types';

export function useAuthFeature() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        console.log("[useAuthFeature] Calling authService.login...");
        try {
            const result = await authService.login(email, password);
            console.log("[useAuthFeature] authService returned:", result);

            if (!result.success) {
                console.error("[useAuthFeature] Login failed:", result.error);
                setError(result.error);
                return null;
            }
            return result.data;
        } catch (err: any) {
            console.error("[useAuthFeature] Exception:", err);
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
