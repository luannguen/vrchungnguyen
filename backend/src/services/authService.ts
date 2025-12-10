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
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

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
            const { error } = await supabase.auth.signOut();
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
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

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
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);

            return success(data?.role || 'user');
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange: (callback: (user: UserDTO | null) => void) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                // We need to fetch the role again to be sure, or store it.
                // For efficiency, we might assume 'user' initially or fetch it.
                // Let's fetch it to be safe.
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
            } else {
                callback(null);
            }
        });
        return subscription;
    }
};
