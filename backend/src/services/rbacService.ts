import { supabase } from '@/lib/supabase';
import { Result, ErrorCodes, success, failure } from '@/components/data/types';

export type Role = string;
export type Permission = string; // Changed from union type to string to support dynamic DB permissions

export interface RoleDef {
    id: Role;
    name: string;
    description: string;
}

export interface PermissionDef {
    id: string;
    code: string;
    description: string;
}

export const rbacService = {
    getUserRole: async (): Promise<Result<Role>> => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) return failure('User not found', ErrorCodes.NOT_FOUND);

            // Fetch role from public.users table as it's the source of truth
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError || !userData) {
                // Fallback to metadata if DB fetch fails (though DB is preferred)
                const metaRole = user.user_metadata?.role as Role || 'user';
                return success(metaRole);
            }

            return success(userData.role as Role);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    // Get all defined roles
    getRoles: async (): Promise<Result<RoleDef[]>> => {
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*')
                .order('id');

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    // Get all available permissions
    getPermissions: async (): Promise<Result<PermissionDef[]>> => {
        try {
            const { data, error } = await supabase
                .from('permissions')
                .select('*')
                .order('code');

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    // Get permissions for a specific role
    getRolePermissions: async (roleId: Role): Promise<Result<string[]>> => {
        try {
            const { data, error } = await supabase
                .from('role_permissions')
                .select('permissions(code)')
                .eq('role_id', roleId);

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);

            // Extract codes from joined data
            const permissions = data.map((item: any) => item.permissions.code);
            return success(permissions);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    // Update permissions for a role
    updateRolePermissions: async (roleId: Role, permissionCodes: string[]): Promise<Result<void>> => {
        try {
            // 1. Get all permission IDs for the provided codes
            const { data: permsData, error: permsError } = await supabase
                .from('permissions')
                .select('id, code')
                .in('code', permissionCodes);

            if (permsError) return failure(permsError.message, ErrorCodes.DB_ERROR);
            const permissionIds = permsData.map(p => p.id);

            // 2. Delete existing permissions for this role
            const { error: deleteError } = await supabase
                .from('role_permissions')
                .delete()
                .eq('role_id', roleId);

            if (deleteError) return failure(deleteError.message, ErrorCodes.DB_ERROR);

            // 3. Insert new permissions
            if (permissionIds.length > 0) {
                const inserts = permissionIds.map(pid => ({
                    role_id: roleId,
                    permission_id: pid
                }));

                const { error: insertError } = await supabase
                    .from('role_permissions')
                    .insert(inserts);

                if (insertError) return failure(insertError.message, ErrorCodes.DB_ERROR);
            }

            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    createRole: async (name: string, description?: string): Promise<Result<RoleDef>> => {
        try {
            // Generate a slug-like ID from the name handling Vietnamese characters
            const slugify = (text: string) => {
                return text
                    .toString()
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]+/g, '')
                    .replace(/--+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '');
            };

            const id = slugify(name) || `role-${Date.now()}`;

            console.log('[rbacService] Creating role:', { name, id });

            const { data, error } = await supabase
                .from('roles')
                .insert({ id, name, description })
                .select()
                .single();

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    updateRole: async (id: string, updates: { name?: string; description?: string }): Promise<Result<RoleDef>> => {
        try {
            const { data, error } = await supabase
                .from('roles')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    deleteRole: async (id: string): Promise<Result<void>> => {
        try {
            const { error } = await supabase
                .from('roles')
                .delete()
                .eq('id', id);

            if (error) return failure(error.message, ErrorCodes.DB_ERROR);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR);
        }
    },

    // Check if a user has a specific permission
    // Note: detailed check should ideally happen server-side or via RLS, 
    // but this is useful for UI conditional rendering.
    hasPermission: async (role: Role, permission: string): Promise<boolean> => {
        // Ideally caching this result would be better for performance
        const { data } = await supabase
            .from('role_permissions')
            .select('permissions!inner(code)')
            .eq('role_id', role)
            .eq('permissions.code', permission)
            .single();

        return !!data;
    }
};
