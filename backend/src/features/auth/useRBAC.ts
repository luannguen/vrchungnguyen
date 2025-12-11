import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { rbacService, Role, Permission } from '@/services/rbacService';

export function useRBAC() {
    const { user } = useAuth();
    const [role, setRole] = useState<Role>('user');

    useEffect(() => {
        if (user?.role) {
            setRole(user.role as Role);
        }
    }, [user]);

    const hasPermission = (permission: Permission) => {
        return rbacService.hasPermission(role, permission);
    };

    const hasRole = (requiredRole: Role) => {
        return role === requiredRole;
    };

    return {
        role,
        hasPermission,
        hasRole
    };
}
