import React from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { useNavigate } from 'react-router-dom';

const UserPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">User Dashboard</h1>
                    <p className="text-gray-600 mb-6">Welcome, {user?.full_name || user?.email}</p>

                    <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
                        <p className="text-sm text-blue-800">
                            Your account does not have administrator privileges.
                            Please contact support if you believe this is an error.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserPage;
