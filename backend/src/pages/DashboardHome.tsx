
import { useAuth } from '@/features/auth/useAuth';
import { useEffect, useState } from 'react';
import { statsService, DashboardStats } from '@/services/statsService';
import { Users, FileText, Package, Calendar, Briefcase, Mail, Loader2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsData, chartData] = await Promise.all([
                    statsService.getDashboardStats(),
                    statsService.getGrowthStats()
                ]);
                setStats(statsData);
                setGrowthData(chartData);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;
    }

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{subtext}</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.full_name || 'Admin'}!</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.users}
                    icon={Users}
                    color="text-blue-500"
                    subtext="Registered accounts"
                />
                <StatCard
                    title="Pending News"
                    value={stats?.news}
                    icon={FileText}
                    color="text-orange-500"
                    subtext="Total articles"
                />
                <StatCard
                    title="New Contacts"
                    value={stats?.contacts_pending}
                    icon={Mail}
                    color="text-red-500"
                    subtext="Unread messages"
                />
                <StatCard
                    title="Total Products"
                    value={stats?.products}
                    icon={Package}
                    color="text-green-500"
                    subtext="Active products"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Projects"
                    value={stats?.projects}
                    icon={Briefcase}
                    color="text-purple-500"
                    subtext="Ongoing & Completed"
                />
                <StatCard
                    title="Events"
                    value={stats?.events}
                    icon={Calendar}
                    color="text-pink-500"
                    subtext="Upcoming & Past"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Monthly Growth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                                    <YAxis className="text-xs" tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card >

        {/* Quick Actions or Recent Contacts Placeholder */ }
        < Card className = "col-span-1" >
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <span className="relative flex h-2 w-2 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <p className="text-sm text-gray-500">System is running normally.</p>
                            </div>
                            {stats?.contacts_pending && stats.contacts_pending > 0 ? (
                                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-100">
                                    You have {stats.contacts_pending} unread contact messages.
                                </div>
                            ) : (
                                <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">
                                    All contact messages have been read.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card >
            </div >
        </div >
    );
}
