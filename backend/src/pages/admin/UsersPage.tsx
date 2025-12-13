import React, { useState } from 'react';
import { UserDTO } from '@/components/data/types';
import { useUser } from '@/features/users/useUser';
import { useAuth } from '@/features/auth/useAuth';
import UserTable from '@/components/admin/users/UserTable';
import { CreateUserDialog } from '@/components/admin/users/CreateUserDialog';
import { EditUserDialog } from '@/components/admin/users/EditUserDialog';
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UsersPage: React.FC = () => {
    const { t } = useTranslation();
    const { useUsers, deleteUser } = useUser();
    const { resetPasswordForEmail } = useAuth();

    // Filter State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [limit] = useState(10);

    // Dialog States
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

    // Fetch Data
    const { data, isLoading } = useUsers({ page, limit, search });
    const users = data?.data?.users || [];
    const total = data?.data?.total || 0;
    const totalPages = data?.data?.totalPages || 0;

    // Handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCreate = () => {
        setCreateOpen(true);
    };

    const handleEdit = (user: UserDTO) => {
        setSelectedUser(user);
        setEditOpen(true);
    };

    const handleDeleteClick = (user: UserDTO) => {
        setSelectedUser(user);
        setDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        try {
            await deleteUser.mutateAsync(selectedUser.id);
            toast.success('User deleted successfully');
            setDeleteOpen(false);
            setSelectedUser(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const handleResetPassword = async (user: UserDTO) => {
        if (confirm(`Send password reset email to ${user.email}?`)) {
            try {
                await resetPasswordForEmail(user.email);
                toast.success(`Password reset email sent to ${user.email}`);
            } catch (error: any) {
                toast.error(error.message || 'Failed to send reset email');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">{t('users_management')}</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        {t('total_users_count', { count: total })}
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create User
                    </Button>
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
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            {/* User Table */}
            <UserTable
                users={users}
                loading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onResetPassword={handleResetPassword}
            />

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-700">
                        {t('page_info', { page: page, total: totalPages })}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Dialogs */}
            <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

            <EditUserDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                user={selectedUser}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UsersPage;
