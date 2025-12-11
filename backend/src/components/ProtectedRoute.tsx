import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useRBAC } from '@/features/auth/useRBAC';
import { Role } from '@/services/rbacService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    requiredRole?: Role;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const { hasRole } = useRBAC();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole) && !hasRole('admin')) {
        // Allow admin to access everything, otherwise check specific role
        // or redirects to 403 / dashboard if unauthorized
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
