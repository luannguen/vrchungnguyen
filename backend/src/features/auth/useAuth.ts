import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { UserDTO, LoginDTO } from '@/components/data/types';
import { supabase } from '@/lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout: stop loading after 10s if nothing happens
        const timeout = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 10000);

        const handleSession = async (session: any) => {
            if (session?.user) {
                const result = await authService.getCurrentUser();
                if (mounted) {
                    if (result.success && result.data) {
                        setUser(result.data);
                    } else {
                        setUser(null);
                    }
                }
            } else {
                if (mounted) setUser(null);
            }

            if (mounted) {
                // If we have a session, stop loading.
                // If checking for redirect (hash has access_token), keep loading until Supabase processes it.
                // Otherwise detailed check:
                const isHandlingRedirect = !session && window.location.hash.includes('access_token');

                if (!isHandlingRedirect) {
                    setLoading(false);
                    clearTimeout(timeout);
                }
            }
        };

        // Check initial session (restored from storage)
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for new auth events (OAuth redirects, etc)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(timeout);
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
