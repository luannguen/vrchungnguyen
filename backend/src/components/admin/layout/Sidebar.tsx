
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCog, Settings, LogOut, Package, Calendar, Briefcase, List, FileText, FolderOpen, Mail, Image, Layout, Book, PenTool
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/features/auth/useAuth';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Users, label: 'Users', href: '/users' },
    { icon: UserCog, label: 'Roles', href: '/roles' },
    { icon: Package, label: 'Products', href: '/products' },
    { icon: Calendar, label: 'Events', href: '/events' },
    { icon: FileText, label: 'News', href: '/news' },
    { icon: FolderOpen, label: 'Categories', href: '/categories' },
    { icon: Briefcase, label: 'Projects', href: '/projects' },
    { icon: List, label: 'Menu', href: '/menu' },
    { icon: Image, label: 'Media Library', href: '/media' },
    { icon: Layout, label: 'Banners', href: '/banners' },
    { icon: Settings, label: 'Services', href: '/services' },
    { icon: PenTool, label: 'Tools & Resources', href: '/resources' }, // Added
    { icon: Book, label: 'Static Pages', href: '/pages' },
    { icon: Mail, label: 'Contacts', href: '/contacts' },
    { icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="flex h-16 items-center justify-center border-b px-6 dark:border-gray-800">
                <h1 className="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Admin VRC</h1>
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={clsx(
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            )}
                        >
                            <Icon
                                className={clsx(
                                    'mr-3 h-5 w-5 flex-shrink-0',
                                    isActive ? 'text-blue-700 dark:text-blue-200' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                                )}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4 dark:border-gray-800">
                <button
                    onClick={handleLogout}
                    className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300" />
                    Sign out
                </button>
            </div>
        </div>
    );
}
