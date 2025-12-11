import { supabase } from '@/lib/supabase';
import { failure, success, ErrorCodes, LoginDTO, Result, SessionDTO, UserDTO } from '@/components/data/types';

export const authService = {
    login: async ({ email, password }: LoginDTO): Promise<Result<SessionDTO>> => {
        try {
            if (!email || !password) {
                return failure('Email and password are required', ErrorCodes.VALIDATION_ERROR);
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return failure(error.message, ErrorCodes.UNAUTHORIZED);
            }

            if (!data.user || !data.session) {
                return failure('Login failed', ErrorCodes.UNKNOWN_ERROR);
            }

            // Fetch user profile from public.users table to get the reliable role
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            const userDTO: UserDTO = {
                id: data.user.id,
                email: data.user.email!,
                full_name: profile?.full_name || data.user.user_metadata?.full_name,
                avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url,
                role: profile?.role || 'user', // Get role from DB, default to user
            };

            return success({
                access_token: data.session.access_token,
                user: userDTO,
            });

        } catch (err: any) {
            return failure(err.message || 'Network error', ErrorCodes.NETWORK_ERROR);
        }
    },

    loginWithGoogle: async (): Promise<Result<{ url: string } | void>> => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}`
                }
            });

            if (error) return failure(error.message, ErrorCodes.UNAUTHORIZED);
            return success(data);
        } catch (err: any) {
            return failure(err.message || 'Network error', ErrorCodes.NETWORK_ERROR);
        }
    },

    logout: async (): Promise<Result<void>> => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(undefined as unknown as void);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    getCurrentUser: async (): Promise<Result<UserDTO>> => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
            }

            // Fetch user profile from public.users table
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            const userDTO: UserDTO = {
                id: user.id,
                email: user.email!,
                full_name: profile?.full_name || user.user_metadata?.full_name,
                avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
                role: profile?.role || 'user',
            };

            return success(userDTO);

        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    }
};
