import { useState, useEffect, useRef } from 'react';
import { authService } from '@/services/authService';
import { UserDTO, LoginDTO } from '@/components/data/types';
import { supabase } from '@/lib/supabase';

export function useAuth() {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(true);

    // Capture the hash and search params immediately
    const initialHash = useRef(window.location.hash);
    const initialSearch = useRef(window.location.search);

    useEffect(() => {
        let mounted = true;

        // Robust check for ANY redirect (Implicit #access_token OR PKCE ?code=)
        const isImplicit = initialHash.current.includes('access_token');
        const isPKCE = initialSearch.current.includes('code');
        const isRedirecting = isImplicit || isPKCE;

        // Safety timeout: stop loading after 15s (PKCE can take longer)
        const timeout = setTimeout(() => {
            if (mounted) {
                setLoading(false);
            }
        }, 15000);

        const handleSession = async (session: any) => {
            if (session?.user) {
                const result = await authService.getCurrentUser();
                if (mounted) {
                    if (result.success && result.data) {
                        setUser(result.data);
                    } else {
                        setUser(null);
                    }
                    // Session confirmed, stop loading
                    setLoading(false);
                    clearTimeout(timeout);
                }
            } else {
                if (mounted) {
                    setUser(null);

                    // IF we are in the middle of a redirect, we MUST NOT stop loading yet.
                    // We wait for Supabase to exchange the code/hash for a session.
                    if (!isRedirecting) {
                        setLoading(false);
                        clearTimeout(timeout);
                    }
                }
            }
        };

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
                handleSession(session);
            } else if (event === 'INITIAL_SESSION') {
                handleSession(session);
            }
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
