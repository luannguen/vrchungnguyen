import { supabase } from '../supabase';
import { Result, success, failure, ErrorCodes } from '../components/data/types';

export interface Role {
    id: string;
    name: string;
    description?: string;
}

export interface Permission {
    id: string;
    code: string;
    description?: string;
}

export const rbacService = {
    /**
     * Get all roles
     */
    getRoles: async (): Promise<Result<Role[]>> => {
        try {
            const { data, error } = await supabase.from('roles').select('*');
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Get all permissions
     */
    getPermissions: async (): Promise<Result<Permission[]>> => {
        try {
            const { data, error } = await supabase.from('permissions').select('*');
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Create a new role
     */
    createRole: async (name: string, description?: string): Promise<Result<Role>> => {
        try {
            const { data, error } = await supabase
                .from('roles')
                .insert({ name, description } as any)
                .select()
                .single();

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Assign permissions to a role
     * This usually involves deleting old permissions and inserting new ones, or just inserting new ones.
     * For simplicity, let's assume we replace all permissions for the role.
     */
    updateRolePermissions: async (roleId: string, permissionIds: string[]): Promise<Result<void>> => {
        try {
            // 1. Delete existing permissions for this role
            const { error: deleteError } = await supabase
                .from('role_permissions')
                .delete()
                .eq('role_id', roleId);

            if (deleteError) return failure(deleteError.message, ErrorCodes.SERVER_ERROR);

            if (permissionIds.length === 0) return success(undefined);

            // 2. Insert new permissions
            const inserts = permissionIds.map(permId => ({
                role_id: roleId,
                permission_id: permId
            }));

            const { error: insertError } = await supabase
                .from('role_permissions')
                .insert(inserts as any);

            if (insertError) return failure(insertError.message, ErrorCodes.SERVER_ERROR);

            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Assign a role to a user.
     * Updates the `profiles` table `role` column or `user_roles` table depending on implementation.
     * Our schema uses `profiles.role` for simple RBAC, but also has `user_roles` linking table in schema.txt?
     * Let's check schema.txt again.
     * 
     * Looking at schema.txt:
     * - `profiles` has `role` column (text).
     * - `user_roles` table exists (user_id, role_id).
     * 
     * To support DYNAMIC RBAC properly, we should use `user_roles` table so one user can potentially have multiple roles, 
     * OR simply link `profiles.role` (text) to `roles.name` (text).
     * 
     * Given the "Dynamic RBAC" requirement, creating/editing roles means the `profiles.role` column (which is likely an enum or text) might be insufficient if it's just a string.
     * However, the schema.txt showed: `role text DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'moderator', 'user'))`.
     * This CHECK constraint limits dynamic roles.
     * 
     * IF we want TRULY dynamic roles (user creates "Manager"), we need to rely on `user_roles` table and remove/ignore the strict check on `profiles.role` or keep `profiles.role` as a "primary" role cache.
     * 
     * For this service, I will proceed with `user_roles` table manipulation if it exists in schema.
     * Let's assume `user_roles` is the source of truth for dynamic permissions.
     */
    assignRoleToUser: async (userId: string, roleId: string): Promise<Result<void>> => {
        try {
            // First, remove existing roles? Or allow multiple? 
            // Usually simpler systems have 1 role per user.
            await supabase.from('user_roles').delete().eq('user_id', userId);

            const { error } = await supabase
                .from('user_roles')
                .insert({ user_id: userId, role_id: roleId } as any);

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);

            // Sync profile.role for backward compatibility if needed, using the role name
            const { data: role } = await supabase.from('roles').select('name').eq('id', roleId).single();
            if (role) {
                await supabase.from('profiles').update({ role: role.name } as any).eq('id', userId);
            }

            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    }
};
