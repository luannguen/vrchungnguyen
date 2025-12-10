import { supabase } from '../supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { Result, success, failure, ErrorCodes, AuthDTO, UserDTO } from '../components/data/types';

/**
 * Service to handle Authentication logic.
 * Wraps Supabase Auth and Profile fetching.
 */
export const authService = {
    /**
     * Login with email and password
     */
    login: async (email: string, password: string): Promise<Result<AuthDTO>> => {
        try {
            const { data, error } = await withTimeout(supabase.auth.signInWithPassword({
                email,
                password,
            }));

            if (error) {
                return failure(error.message, ErrorCodes.UNAUTHORIZED);
            }

            if (!data.user) {
                return failure('User not found', ErrorCodes.NOT_FOUND);
            }

            // Fetch role
            const roleResult = await authService.getUserRole(data.user.id);
            const role = roleResult.success ? roleResult.data : 'user';

            const userDTO: UserDTO = {
                id: data.user.id,
                email: data.user.email || '',
                role: role as 'admin' | 'user' | 'moderator',
                fullName: data.user.user_metadata?.full_name,
                avatarUrl: data.user.user_metadata?.avatar_url,
            };

            return success({
                user: userDTO,
                session: data.session,
            });
        } catch (err: any) {
            return failure(err.message || 'Login failed', ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Sign out
     */
    logout: async (): Promise<Result<void>> => {
        try {
            const { error } = await withTimeout(supabase.auth.signOut());
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Send password reset email
     */
    resetPassword: async (email: string): Promise<Result<void>> => {
        try {
            // Note: withTimeout might assume a response, resetPasswordForEmail returns { data, error }
            const { error } = await withTimeout(supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            }));

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Update user password (logged in)
     */
    updatePassword: async (password: string): Promise<Result<void>> => {
        try {
            const { error } = await withTimeout(supabase.auth.updateUser({ password }));

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Get current user details including role
     */
    getCurrentUser: async (): Promise<Result<UserDTO>> => {
        const start = Date.now();
        console.log("[authService] getCurrentUser called");
        try {
            const { data: { session }, error } = await withTimeout(supabase.auth.getSession());
            console.log(`[authService] getSession took ${Date.now() - start}ms`);

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            if (!session?.user) return failure('No active session', ErrorCodes.UNAUTHORIZED);

            const roleResult = await authService.getUserRole(session.user.id);
            const role = roleResult.success ? roleResult.data : 'user';

            const userDTO: UserDTO = {
                id: session.user.id,
                email: session.user.email || '',
                role: role as 'admin' | 'user' | 'moderator',
                fullName: session.user.user_metadata?.full_name,
                avatarUrl: session.user.user_metadata?.avatar_url,
            };

            return success(userDTO);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Helper to get user role from profiles table
     */
    getUserRole: async (userId: string): Promise<Result<string>> => {
        console.log(`[authService] getUserRole called for ${userId}`);
        const start = Date.now();
        try {
            const { data, error } = await withTimeout(supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single());

            console.log(`[authService] getUserRole took ${Date.now() - start}ms`);

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);

            return success((data as any)?.role || 'user');
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Subscribe to auth state changes
     */
    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange: (callback: (user: UserDTO | null) => void) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                // Use the new helper if we can, or just standard call. 
                // Note: Callbacks can't easily use the helper Result pattern directly without async handling in UI.
                // We'll trust onAuthStateChange fires correctly, but the internal fetch uses getUserRole which needs timeout.

                try {
                    const roleResult = await authService.getUserRole(session.user.id);
                    const role = roleResult.success ? roleResult.data : 'user';

                    const userDTO: UserDTO = {
                        id: session.user.id,
                        email: session.user.email || '',
                        role: role as 'admin' | 'user' | 'moderator',
                        fullName: session.user.user_metadata?.full_name,
                        avatarUrl: session.user.user_metadata?.avatar_url,
                    };
                    callback(userDTO);
                } catch (e) {
                    console.error("Error in auth state change:", e);
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
        return subscription;
    }
};

/**
 * Helper to wrap promises with a timeout
 */
async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number = 8000): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs)
    );
    return Promise.race([promise as Promise<T>, timeoutPromise]);
}
