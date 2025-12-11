import { supabase } from '@/lib/supabase';
import { Result, ErrorCodes, success, failure } from '@/components/data/types';

export type Role = 'admin' | 'editor' | 'user';
export type Permission = 'read:users' | 'write:users' | 'read:content' | 'write:content' | 'delete:content' | 'manage:settings';

export const rbacService = {
    getUserRole: async (): Promise<Result<Role>> => {
        try {
            // Check metadata first
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return failure('User not found', ErrorCodes.NOT_FOUND);

            const role = user.user_metadata?.role as Role || 'user';
            return success(role);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    permissions: {
        'admin': ['read:users', 'write:users', 'read:content', 'write:content', 'delete:content', 'manage:settings'],
        'editor': ['read:users', 'read:content', 'write:content'],
        'user': ['read:content']
    } as Record<Role, Permission[]>,

    hasPermission: (role: Role, permission: Permission): boolean => {
        const rolePermissions = rbacService.permissions[role] || [];
        return rolePermissions.includes(permission);
    }
};
