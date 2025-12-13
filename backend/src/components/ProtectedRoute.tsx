import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useRBAC } from '@/features/auth/useRBAC';
import { Role } from '@/services/rbacService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    requiredRole?: Role | Role[];
    requiredPermission?: string;
    oneOfPermissions?: string[]; // New prop: Access if user has ANY of these permissions
    children?: React.ReactNode;
}

export default function ProtectedRoute({
    requiredRole,
    requiredPermission,
    oneOfPermissions,
    children
}: ProtectedRouteProps) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { hasRole, hasPermission, isLoading: rbacLoading } = useRBAC();

    if (authLoading || (isAuthenticated && rbacLoading)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Strict role check: if role is required and user lacks it
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/user" replace />;
    }

    // Single Permission check
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/user" replace />;
    }

    // Multiple Permissions check (OR logic)
    if (oneOfPermissions && oneOfPermissions.length > 0) {
        const hasAny = oneOfPermissions.some(p => hasPermission(p));
        if (!hasAny) {
            return <Navigate to="/user" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
}
