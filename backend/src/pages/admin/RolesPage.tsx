import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rbacService, RoleDef, PermissionDef, Role } from '@/services/rbacService';
import { toast } from 'sonner';
import { Loader2, Plus, Trash, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRBAC } from '@/features/auth/useRBAC';
import { RoleDialog } from '@/components/admin/roles/RoleDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const RolesPage: React.FC = () => {
    const { t } = useTranslation();
    const { hasPermission } = useRBAC();
    const [roles, setRoles] = useState<RoleDef[]>([]);
    const [permissions, setPermissions] = useState<PermissionDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [rolePermissions, setRolePermissions] = useState<Record<Role, Set<string>>>({});
    const [saving, setSaving] = useState(false);

    // Dialog handling
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleDef | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<RoleDef | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [rolesResult, permissionsResult] = await Promise.all([
                rbacService.getRoles(),
                rbacService.getPermissions()
            ]);

            if (!rolesResult.success || !permissionsResult.success) {
                toast.error('Failed to load roles or permissions');
                return;
            }

            setRoles(rolesResult.data || []);
            setPermissions(permissionsResult.data || []);

            // Load permissions for each role
            const perms: Record<Role, Set<string>> = {};
            await Promise.all((rolesResult.data || []).map(async (role) => {
                const result = await rbacService.getRolePermissions(role.id);
                if (result.success && result.data) {
                    perms[role.id] = new Set(result.data);
                } else {
                    perms[role.id] = new Set();
                }
            }));
            setRolePermissions(perms);

        } catch (error) {
            toast.error('An error occurred while loading data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (roleId: Role, permissionCode: string) => {
        if (!hasPermission('roles.manage')) return;

        setRolePermissions(prev => {
            const newPerms = { ...prev };
            const roleSet = new Set(newPerms[roleId] || []);

            if (roleSet.has(permissionCode)) {
                roleSet.delete(permissionCode);
            } else {
                roleSet.add(permissionCode);
            }

            newPerms[roleId] = roleSet;
            return newPerms;
        });
    };

    const handleSavePermissions = async (roleId: Role) => {
        if (!hasPermission('roles.manage')) return;

        try {
            setSaving(true);
            const perms = Array.from(rolePermissions[roleId] || []);
            const result = await rbacService.updateRolePermissions(roleId, perms);

            if (result.success) {
                toast.success(t('roles_management.permissions_updated', 'Permissions updated'));
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };
    //...
    const handleRoleSubmit = async (values: { name: string; description?: string }) => {
        try {
            let result;
            if (editingRole) {
                result = await rbacService.updateRole(editingRole.id, values);
            } else {
                result = await rbacService.createRole(values.name, values.description);
            }

            if (result.success) {
                toast.success(editingRole ? t('roles_management.update_success', 'Role updated successfully') : t('roles_management.create_success', 'Role created successfully'));
                loadData(); // Reload to refresh list
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const confirmDeleteRole = async () => {
        if (!roleToDelete) return;
        try {
            const result = await rbacService.deleteRole(roleToDelete.id);
            if (result.success) {
                toast.success(t('roles_management.delete_success', 'Role deleted successfully'));
                loadData();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Failed to delete role');
        } finally {
            setRoleToDelete(null);
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('roles_management.title', 'Roles Management')}</h1>
                {hasPermission('roles.manage') && (
                    <Button onClick={() => { setEditingRole(null); setIsRoleDialogOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('create', 'Create')}
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <div key={role.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{role.name}</h3>
                                    <p className="text-sm text-gray-500">{role.description}</p>
                                </div>
                                {hasPermission('roles.manage') && (
                                    <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => { setEditingRole(role); setIsRoleDialogOpen(true); }}>
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setRoleToDelete(role)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-4">
                                <h4 className="text-sm font-medium text-gray-700">{t('roles_management.role_permissions', 'Permissions')}</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {permissions.map((perm) => {
                                        const isAssigned = (rolePermissions[role.id] || new Set()).has(perm.code);
                                        return (
                                            <div
                                                key={perm.code}
                                                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${isAssigned ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                    }`}
                                                onClick={() => togglePermission(role.id, perm.code)}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isAssigned ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                                                    }`}>
                                                    {isAssigned && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <span className="text-sm">{perm.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {hasPermission('roles.manage') && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <Button
                                        className="w-full"
                                        onClick={() => handleSavePermissions(role.id)}
                                        disabled={saving}
                                    >
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('save_changes', 'Save Changes')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <RoleDialog
                open={isRoleDialogOpen}
                onOpenChange={setIsRoleDialogOpen}
                role={editingRole}
                onSubmit={handleRoleSubmit}
            />

            <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('roles_management.delete_confirm_title', 'Are you absolutely sure?')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('roles_management.delete_confirm_desc', 'This action cannot be undone. This will permanently delete the role.')} "{roleToDelete?.name}"
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel', 'Cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteRole} className="bg-red-600 hover:bg-red-700">
                            {t('roles_management.delete_button', 'Delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RolesPage;
