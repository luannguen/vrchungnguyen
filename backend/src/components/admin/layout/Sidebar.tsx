import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCog, Settings, LogOut, Package, Calendar, Briefcase,
    List, FileText, FolderOpen, Mail, Image, Layout, Book, PenTool, Trophy, HelpCircle,
    ChevronDown, ChevronRight, Menu as MenuIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/features/auth/useAuth';
import { useTranslation } from 'react-i18next';

const menuGroups = [
    {
        label: 'dashboard',
        items: [
            { icon: LayoutDashboard, label: 'overview', href: '/' },
        ]
    },
    {
        label: 'content_management',
        items: [
            { icon: FileText, label: 'news', href: '/news' },
            { icon: Package, label: 'products', href: '/products' },
            { icon: FolderOpen, label: 'categories', href: '/categories' },
            { icon: Book, label: 'pages', href: '/pages' },
            { icon: Briefcase, label: 'projects', href: '/projects' },
            { icon: Image, label: 'media', href: '/media' },
            { icon: Layout, label: 'banners', href: '/banners' },
            { icon: Calendar, label: 'events', href: '/events' },
            { icon: Mail, label: 'contacts', href: '/contacts' },
            { icon: Users, label: 'team', href: '/team' },
        ]
    },
    {
        label: 'system_settings',
        items: [
            { icon: Users, label: 'users', href: '/users' },
            { icon: UserCog, label: 'roles', href: '/roles' },
            { icon: List, label: 'navigation', href: '/menu' },
            { icon: Settings, label: 'settings', href: '/settings' },
        ]
    },
    {
        label: 'support',
        items: [
            { icon: PenTool, label: 'resources', href: '/resources' },
            { icon: Trophy, label: 'achievements', href: '/achievements' },
            { icon: HelpCircle, label: 'faqs', href: '/faqs' },
        ]
    },
];

export function Sidebar() {
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        'content_management': true,
        'system_settings': true,
        'dashboard': true,
        'support': false
    });

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const handleLogout = async () => {
        await logout();
    };

    // Helper to normalize path comparison (handling trailing slashes or sub-routes)
    const isLinkActive = (href: string) => {
        if (href === '/' && location.pathname === '/') return true;
        if (href !== '/' && location.pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800">
            <div className="flex h-16 items-center justify-center border-b px-6 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <Link to="/" className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-md">
                        <MenuIcon className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white">Admin VRC</h1>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {menuGroups.map((group) => (
                    <div key={group.label}>
                        <button
                            onClick={() => toggleGroup(group.label)}
                            className="flex w-full items-center justify-between px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                            {t(group.label)}
                            {openGroups[group.label] ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronRight className="h-3 w-3" />
                            )}
                        </button>

                        {openGroups[group.label] && (
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isLinkActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            className={clsx(
                                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/20 dark:text-blue-200'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                            )}
                                        >
                                            <Icon
                                                className={clsx(
                                                    'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                                    isActive
                                                        ? 'text-blue-700 dark:text-blue-200'
                                                        : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                                                )}
                                            />
                                            {t(item.label)}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="border-t p-4 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <button
                    onClick={handleLogout}
                    className="group flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:shadow-sm transition-all duration-200 dark:text-red-400 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('sign_out')}
                </button>
            </div>
        </div>
    );
}
