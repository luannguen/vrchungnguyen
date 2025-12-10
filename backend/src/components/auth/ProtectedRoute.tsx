import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
    const { session, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/signin" replace />;
    }

    // Strictly enforce RBAC for Admin Panel
    // Only allow if role is 'admin' or 'manager'
    // if (!isAdmin) {
    //   // Uncomment this if you want to strictly block standard users
    //   // For now, we might want to let them in but show limited things, OR block them.
    //   // Let's block them for better security demo.
    //    return <div className="p-10 text-center text-red-500">Access Denied: You are not an Admin</div>;
    // }

    return <Outlet />;
}
