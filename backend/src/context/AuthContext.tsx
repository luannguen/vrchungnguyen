import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserDTO } from '../components/data/types';
import { authService } from '../services/authService';

type AuthContextType = {
    user: UserDTO | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    role: string | null;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signOut: async () => { },
    isAdmin: false,
    role: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial check
        const initAuth = async () => {
            const result = await authService.getCurrentUser();
            if (result.success) {
                setUser(result.data);
            }
            setIsLoading(false);
        };
        initAuth();

        // Subscribe to changes
        const subscription = authService.onAuthStateChange((updatedUser) => {
            setUser(updatedUser);
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await authService.logout();
        setUser(null);
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'manager'; // manager included for backward compatibility logic if any

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            signOut,
            isAdmin,
            role: user?.role || null
        }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
