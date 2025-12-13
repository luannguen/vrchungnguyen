import { useAuth } from './useAuth';
import { rbacService, Role, Permission } from '@/services/rbacService';
import { useQuery } from '@tanstack/react-query';

export function useRBAC() {
    const { user } = useAuth();

    // Fetch permissions for the current user's role
    const { data: permissions = [] } = useQuery({
        queryKey: ['permissions', user?.role],
        queryFn: async () => {
            if (!user?.role) return [];
            const result = await rbacService.getRolePermissions(user.role as Role);
            return result.success && result.data ? result.data : [];
        },
        enabled: !!user?.role,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    const hasPermission = (permission: Permission) => {
        return permissions.includes(permission);
    };

    const hasRole = (requiredRole: Role | Role[]) => {
        if (!user?.role) return false;

        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(user.role as Role);
        }

        return user.role === requiredRole;
    };

    return {
        role: user?.role as Role,
        permissions,
        hasPermission,
        hasRole
    };
}
