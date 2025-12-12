import React, { useEffect, useState } from 'react';
import { rbacService, Role, PermissionDef, RoleDef } from '@/services/rbacService';
import { Shield, Loader2, Save } from "lucide-react";

const RolesPage: React.FC = () => {
    const [roles, setRoles] = useState<RoleDef[]>([]);
    const [permissions, setPermissions] = useState<PermissionDef[]>([]);
    const [rolePermissions, setRolePermissions] = useState<Record<Role, string[]>>({
        admin: [],
        editor: [],
        user: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rolesResult, permsResult] = await Promise.all([
                rbacService.getRoles(),
                rbacService.getPermissions()
            ]);

            if (rolesResult.success && permsResult.success) {
                setRoles(rolesResult.data || []);
                setPermissions(permsResult.data || []);

                // Load permissions for each role
                const rpMap: Record<string, string[]> = {};
                for (const role of rolesResult.data || []) {
                    const rpResult = await rbacService.getRolePermissions(role.id);
                    if (rpResult.success) {
                        rpMap[role.id] = rpResult.data || [];
                    }
                }
                setRolePermissions(rpMap as Record<Role, string[]>);
            }
        } catch (error) {
            console.error('Failed to load roles data', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (roleId: Role, permissionCode: string) => {
        setRolePermissions(prev => {
            const current = prev[roleId] || [];
            if (current.includes(permissionCode)) {
                return { ...prev, [roleId]: current.filter(c => c !== permissionCode) };
            } else {
                return { ...prev, [roleId]: [...current, permissionCode] };
            }
        });
    };

    const handleSave = async (roleId: Role) => {
        setSaving(true);
        try {
            const result = await rbacService.updateRolePermissions(roleId, rolePermissions[roleId]);
            if (result.success) {
                alert(`Permissions updated for ${roleId}`);
            } else {
                alert(`Failed to update: ${result.code}`);
            }
        } catch (error) {
            console.error('Save failed', error);
            alert('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Roles Management</h1>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Role Permissions
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Manage access levels for each role. Click a checkbox to toggle permission.
                        Don't forget to save changes for each role.
                    </p>
                </div>
                <div className="border-t border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Permission
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                        <div className="flex flex-col items-center">
                                            <Shield className={`h-5 w-5 mb-1 ${role.id === 'admin' ? 'text-purple-500' :
                                                role.id === 'editor' ? 'text-blue-500' : 'text-green-500'
                                                }`} />
                                            {role.name}
                                            <button
                                                onClick={() => handleSave(role.id)}
                                                disabled={saving}
                                                className="mt-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                <Save className="h-3 w-3 mr-1" />
                                                Save
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {permissions.map(permission => (
                                <tr key={permission.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{permission.code}</span>
                                            <span className="text-xs text-gray-500 font-normal">{permission.description}</span>
                                        </div>
                                    </td>
                                    {roles.map(role => {
                                        const hasPerm = rolePermissions[role.id]?.includes(permission.code);
                                        return (
                                            <td key={`${role.id}-${permission.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasPerm || false}
                                                        onChange={() => togglePermission(role.id, permission.code)}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                                    />
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RolesPage;
