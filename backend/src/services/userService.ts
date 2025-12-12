import { supabase } from '@/lib/supabase';
import { Result, ErrorCodes, success, failure, UserDTO } from '@/components/data/types';
import { Role } from './rbacService';

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
    }
};
