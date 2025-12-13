import React from 'react';
import { UserDTO } from '@/components/data/types';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserActions } from './UserActions';

interface UserTableProps {
    users: UserDTO[];
    loading: boolean;
    onEdit: (user: UserDTO) => void;
    onDelete: (user: UserDTO) => void;
    onResetPassword: (user: UserDTO) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit, onDelete, onResetPassword }) => {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                {t('no_users_found')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-left text-sm text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                        <th className="px-6 py-3">{t('user_header')}</th>
                        <th className="px-6 py-3">{t('email_header')}</th>
                        <th className="px-6 py-3">{t('role_header')}</th>
                        <th className="px-6 py-3 text-right">{t('actions_header')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name || user.email}`}
                                            alt=""
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                    user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <UserActions
                                    user={user}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onResetPassword={onResetPassword}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
