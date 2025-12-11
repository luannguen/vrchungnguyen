import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserDTO, LoginDTO } from '@/components/data/types';
import { supabase } from '@/lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const result = await authService.getCurrentUser();
                if (mounted) {
                    if (result.success && result.data) {
                        setUser(result.data);
                    } else {
                        // Fallback to session user if service fails, or handle error
                        // But usually getCurrentUser just wraps getUser.
                        // If it fails, we might not want to log them in fully.
                        setUser(null);
                    }
                }
            } else {
                if (mounted) {
                    setUser(null);
                }
            }
            if (mounted) {
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (data: LoginDTO) => {
        return await authService.login(data);
    };

    const logout = async () => {
        const result = await authService.logout();
        if (result.success) {
            setUser(null);
        }
        return result;
    };

    return {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };
}
