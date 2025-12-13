import { supabase } from '@/lib/supabase';
import { Result, ErrorCodes, success, failure, UserDTO, CreateUserDTO, UpdateUserDTO } from '@/components/data/types';
import { Role } from './rbacService';
import { createClient } from '@supabase/supabase-js';

// Environment variables should be accessed via import.meta.env in Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface UsersFilter {
    page: number;
    limit: number;
    search?: string;
}

export interface UsersResponse {
    users: UserDTO[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const userService = {
    getUsers: async ({ page, limit, search }: UsersFilter): Promise<Result<UsersResponse>> => {
        try {
            let query = supabase
                .from('users')
                .select('*', { count: 'exact' });

            if (search) {
                query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
            }

            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data, error, count } = await query
                .range(from, to)
                .order('created_at', { ascending: false });

            if (error) {
                return failure(error.message, ErrorCodes.DB_ERROR);
            }

            const users: UserDTO[] = data.map((user: any) => ({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role as Role,
            }));

            return success({
                users,
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            });

        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    updateUserRole: async (userId: string, role: Role): Promise<Result<void>> => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role })
                .eq('id', userId);

            if (error) {
                return failure(error.message, ErrorCodes.DB_ERROR);
            }

            return success(undefined);

        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    createUser: async (data: CreateUserDTO): Promise<Result<UserDTO>> => {
        try {
            // 1. Create a temporary client to avoid signing out the admin
            const tempClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // 2. Sign up the new user
            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                    }
                }
            });

            if (authError) {
                return failure(authError.message, ErrorCodes.SERVER_ERROR);
            }

            if (!authData.user) {
                return failure('Failed to create user', ErrorCodes.UNKNOWN_ERROR);
            }

            const userId = authData.user.id;

            // 3. Admin updates the user profile with role (using main authenticated client)
            const { error: profileError } = await supabase
                .from('users')
                .update({
                    role: data.role || 'user',
                    full_name: data.full_name
                })
                .eq('id', userId);

            // Note: If the trigger didn't create the user row yet, we might need to insert it. 
            // Usually Supabase requires a trigger on auth.users -> public.users.
            // If update fails because row doesn't exist, we might need to retry or insert. 
            // Assuming the standard trigger exists as per previous context.

            if (profileError) {
                // If the trigger hasn't run yet, we might get an error or no rows updated.
                // In a robust system, we might want to check existence.
                return failure(profileError.message, ErrorCodes.DB_ERROR);
            }

            const newUser: UserDTO = {
                id: userId,
                email: data.email,
                full_name: data.full_name,
                role: data.role
            };

            return success(newUser);

        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    updateUser: async (id: string, data: UpdateUserDTO): Promise<Result<void>> => {
        try {
            // Update profile fields
            const updates: any = {};
            if (data.full_name) updates.full_name = data.full_name;
            if (data.role) updates.role = data.role;

            if (Object.keys(updates).length > 0) {
                const { error } = await supabase
                    .from('users')
                    .update(updates)
                    .eq('id', id);

                if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            }

            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    deleteUser: async (id: string): Promise<Result<void>> => {
        try {
            // Note: This only deletes from public.users. 
            // To delete from auth.users, we need a backend function.
            // For now, we only remove access by deleting the profile which usually breaks RLS or app logic.
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', id);

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    }
};
