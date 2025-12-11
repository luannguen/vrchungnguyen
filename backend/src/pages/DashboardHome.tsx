import { useAuth } from '@/features/auth/useAuth';

export default function DashboardHome() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                {user && (
                    <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                        {user.avatar_url && (
                            <img src={user.avatar_url} alt={user.full_name} className="h-10 w-10 rounded-full" />
                        )}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.full_name || 'User'}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                {user.role || 'user'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
                <p>Hello! If you signed in with Google, you are seeing this because authentication works!</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards Placeholders */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <div className="h-12 w-12 rounded bg-blue-100 dark:bg-blue-900/20"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
