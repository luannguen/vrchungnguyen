import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserDTO } from '../components/data/types';
import { authService } from '../services/authService';

type AuthContextType = {
    user: UserDTO | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    role: string | null;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signOut: async () => { },
    isAdmin: false,
    role: null,
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Initial check with Timeout Safety
        const initAuth = async () => {
            console.log("[AuthContext] Initializing...");
            const startStr = Date.now();
            try {
                // authService has its own 8s internal timeout, so we just await it.
                // This prevents the "Auth check timed out" false positive at 5s.
                const result = await authService.getCurrentUser();

                if (mounted) {
                    const duration = Date.now() - startStr;
                    console.log(`[AuthContext] Init took ${duration}ms`);

                    if (result.success) {
                        console.log("[AuthContext] User found:", result.data.email);
                        setUser(result.data);
                    } else {
                        console.log("[AuthContext] No active session found (init).");
                        // We don't clear user here necessarily, initial state is null
                    }
                }
            } catch (err) {
                console.error("[AuthContext] Error during init:", err);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    console.log("[AuthContext] Loading state set to false");
                }
            }
        };

        initAuth();

        // Subscribe to changes
        const subscription = authService.onAuthStateChange((updatedUser) => {
            if (mounted) {
                console.log("[AuthContext] Auth state changed:", updatedUser ? "User Logged In" : "User Logged Out");
                setUser(updatedUser);
                setIsLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        console.log("[AuthContext] Signing out...");
        await authService.logout();
        localStorage.clear();
        setUser(null);
        console.log("[AuthContext] Signed out and state cleared.");
    };

    const refreshUser = async () => {
        try {
            const result = await authService.getCurrentUser();
            if (result.success) {
                setUser(result.data);
            }
        } catch (error) {
            console.error("[AuthContext] Failed to refresh user:", error);
        }
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'manager';

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            signOut,
            isAdmin,
            role: user?.role || null,
            refreshUser
        }}>
            {isLoading ? (
                <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                    <div className="w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
