import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    role: string | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    isLoading: true,
    signOut: async () => { },
    isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
            } else {
                setRole(data?.role ?? 'user');
            }
        } catch (error) {
            console.error('Error fetching role:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setSession(null);
        setUser(null);
    };

    const isAdmin = role === 'admin' || role === 'manager';

    return (
        <AuthContext.Provider value={{ session, user, role, isLoading, signOut, isAdmin }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
