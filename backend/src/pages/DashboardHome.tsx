export default function DashboardHome() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
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
