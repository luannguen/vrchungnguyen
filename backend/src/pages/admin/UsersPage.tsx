import React, { useEffect, useState, useCallback } from 'react';
import { UserDTO } from '@/components/data/types';
import { userService, UsersFilter } from '@/services/userService';
import { Role } from '@/services/rbacService';
import UserTable from '@/components/admin/users/UserTable';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UsersPage: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<UsersFilter>({
        page: 1,
        limit: 10,
        search: ''
    });
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await userService.getUsers(filter);
        if (result.success && result.data) {
            setUsers(result.data.users);
            setTotal(result.data.total);
            setTotalPages(result.data.totalPages);
        } else {
            console.error('Failed to fetch users:', result.error);
        }
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300); // 300ms debounce for search

        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setFilter(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleUpdateRole = async (userId: string, role: Role) => {
        const result = await userService.updateUserRole(userId, role);
        if (result.success) {
            fetchUsers(); // Refresh list after update
        } else {
            alert(t('update_role_fail'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">{t('users_management')}</h1>
                <div className="text-sm text-gray-500">
                    {t('total_users_count', { count: total })}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={t('search_users_placeholder')}
                    value={filter.search}
                    onChange={handleSearchChange}
                />
            </div>

            {/* User Table */}
            <UserTable
                users={users}
                loading={loading}
                onUpdateRole={handleUpdateRole}
            />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => handlePageChange(filter.page - 1)}
                        disabled={filter.page === 1}
                        className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-700">
                        {t('page_info', { page: filter.page, total: totalPages })}
                    </span>
                    <button
                        onClick={() => handlePageChange(filter.page + 1)}
                        disabled={filter.page === totalPages}
                        className="p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
