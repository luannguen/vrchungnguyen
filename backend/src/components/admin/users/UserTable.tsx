import React, { useState } from 'react';
import { UserDTO } from '@/components/data/types';
import { Role } from '@/services/rbacService';
import { Loader2, Edit2, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserTableProps {
    users: UserDTO[];
    loading: boolean;
    onUpdateRole: (userId: string, role: Role) => Promise<void>;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onUpdateRole }) => {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role>('user');
    const [updating, setUpdating] = useState(false);

    const handleEditClick = (user: UserDTO) => {
        setEditingId(user.id);
        setSelectedRole(user.role as Role);
    };

    const handleCancel = () => {
        setEditingId(null);
        setUpdating(false);
    };

    const handleSave = async (userId: string) => {
        setUpdating(true);
        try {
            await onUpdateRole(userId, selectedRole);
            setEditingId(null);
        } catch (error) {
            console.error('Failed to update role', error);
        } finally {
            setUpdating(false);
        }
    };

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
                                {editingId === user.id ? (
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-1 border"
                                        disabled={updating}
                                    >
                                        <option value="user">{t('user_role')}</option>
                                        <option value="editor">{t('editor_role')}</option>
                                        <option value="admin">{t('admin_role')}</option>
                                    </select>
                                ) : (
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {editingId === user.id ? (
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => handleSave(user.id)}
                                            disabled={updating}
                                            className="text-green-600 hover:text-green-900 mx-1"
                                            title={t('save')}
                                        >
                                            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={updating}
                                            className="text-red-600 hover:text-red-900 mx-1"
                                            title={t('cancel')}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title={t('edit_role')}
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
