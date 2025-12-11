import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserDTO, LoginDTO } from '@/components/data/types';
import { supabase } from '@/lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            const result = await authService.getCurrentUser();
            if (result.success && result.data) {
                setUser(result.data);
            }
            setLoading(false);
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const result = await authService.getCurrentUser();
                if (result.success && result.data) {
                    setUser(result.data);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
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
