import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCog, Settings, LogOut, Package, Calendar, Briefcase,
    List, FileText, FolderOpen, Mail, Image, Layout, Book, PenTool, Trophy, HelpCircle,
    ChevronDown, ChevronRight, Menu as MenuIcon, LucideIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/features/auth/useAuth';
import { useRBAC } from '@/features/auth/useRBAC';
import { useTranslation } from 'react-i18next';
import { Permission } from '@/components/data/types';

interface MenuItem {
    icon: LucideIcon;
    label: string;
    href: string;
    permission?: Permission;
}

interface MenuGroup {
    label: string;
    items: MenuItem[];
    permissions?: Permission[];
}

const menuGroups: MenuGroup[] = [
    {
        label: 'dashboard',
        permissions: ['dashboard.view'],
        items: [
            { icon: LayoutDashboard, label: 'overview', href: '/' },
        ]
    },
    {
        label: 'content_management',
        permissions: ['content.view', 'content.create', 'content.edit', 'content.delete'],
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
        permissions: ['settings.view', 'users.view', 'roles.manage'],
        items: [
            { icon: Users, label: 'users', href: '/users', permission: 'users.view' },
            { icon: UserCog, label: 'roles', href: '/roles', permission: 'roles.manage' },
            { icon: List, label: 'navigation', href: '/menu', permission: 'settings.manage' },
            { icon: Settings, label: 'settings', href: '/settings', permission: 'settings.view' },
        ]
    },
    {
        label: 'support',
        permissions: ['content.view'],
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
    const { hasPermission } = useRBAC();

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
                {menuGroups.map((group) => {
                    // Check group visibility:
                    // 1. If group has 'permissions' array, user must have AT LEAST ONE.
                    // 2. Or if items have specific permissions, user must see AT LEAST ONE item.
                    const canViewLocal = group.permissions
                        ? group.permissions.some(p => hasPermission(p))
                        : true;

                    // Filter items based on their individual permission
                    // If item has NO permission, it inherits the group's permission result (canViewLocal)
                    const visibleItems = group.items.filter(item => {
                        if (item.permission) {
                            return hasPermission(item.permission);
                        }
                        return canViewLocal;
                    });

                    // If user can't view any item in this group, hide the group
                    // Logic: If NO items are visible, hide group.
                    if (visibleItems.length === 0) return null;

                    return (
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
                                    {visibleItems.map((item) => {
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
                    );
                })}
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
