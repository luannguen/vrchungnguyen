import { useEffect, useState } from "react";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import Checkbox from "../../components/form/input/Checkbox";
import Label from "../../components/form/Label";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { rbacService, Role, Permission } from "../../services/rbacService";

const RoleManagement = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Create/Edit Role State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleName, setRoleName] = useState("");
    const [roleDescription, setRoleDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const [rolesRes, permsRes] = await Promise.all([
            rbacService.getRoles(),
            rbacService.getPermissions()
        ]);

        if (rolesRes.success) setRoles(rolesRes.data);
        if (permsRes.success) setPermissions(permsRes.data);
        setIsLoading(false);
    };

    const handleCreateOrUpdateRole = async () => {
        if (!roleName) return;

        try {
            let roleId = editingRole?.id;

            if (editingRole) {
                // Logic for updating role metadata if supported
            } else {
                const res = await rbacService.createRole(roleName, roleDescription);
                if (res.success) {
                    roleId = res.data.id;
                    alert("Thành công: Đã tạo vai trò mới");
                } else {
                    alert("Lỗi: " + (res as any).error);
                    return;
                }
            }

            if (roleId) {
                const permRes = await rbacService.updateRolePermissions(roleId, selectedPermissions);
                if (permRes.success) {
                    if (editingRole) alert("Thành công: Đã cập nhật quyền hạn");
                } else {
                    alert("Lỗi cập nhật quyền: " + (permRes as any).error);
                }
            }

            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Đã xảy ra lỗi");
        }
    };

    const openEditDialog = async (role: Role) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRoleDescription(role.description || "");

        // Note: Ideally we fetch current permissions for the role here.
        // For MVP, we start with empty or would need a getRolePermissions API.
        // Assuming we need to implement that in service later.
        setSelectedPermissions([]);

        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingRole(null);
        setRoleName("");
        setRoleDescription("");
        setSelectedPermissions([]);
    };

    const togglePermission = (permId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        );
    };

    return (
        <>
            <PageMeta
                title="Quản lý Vai trò | VRC Admin"
                description="Định nghĩa các vai trò và quyền hạn trong hệ thống"
            />
            <PageBreadcrumb pageTitle="Quản lý Vai trò (RBAC)" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Danh sách Vai trò
                        </h3>
                    </div>
                    <div>
                        <Button size="sm" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                            Tạo vai trò mới
                        </Button>
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                            <TableRow>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Tên vai trò</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start dark:text-gray-400">Mô tả</TableCell>
                                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end dark:text-gray-400">Hành động</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{role.name}</TableCell>
                                    <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{role.description}</TableCell>
                                    <TableCell className="px-5 py-4 text-end">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditDialog(role)}>
                                                Chỉnh sửa / Phân quyền
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {roles.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400" colSpan={3}>Chưa có dữ liệu</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[700px] m-4">
                <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14 mb-6">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            {editingRole ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Thiết lập tên vai trò và gắn các quyền hạn tương ứng.
                        </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleCreateOrUpdateRole(); }}>
                        <div className="custom-scrollbar h-[400px] overflow-y-auto px-2 pb-3">
                            <div className="mb-6 space-y-4">
                                <div>
                                    <Label>Tên vai trò</Label>
                                    <Input
                                        type="text"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        disabled={!!editingRole}
                                        placeholder="Nhập tên vai trò..."
                                    />
                                </div>
                                <div>
                                    <Label>Mô tả</Label>
                                    <Input
                                        type="text"
                                        value={roleDescription}
                                        onChange={(e) => setRoleDescription(e.target.value)}
                                        placeholder="Nhập mô tả ngắn..."
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                <h5 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">Phân quyền</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {permissions.map(perm => (
                                        <div key={perm.id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                                            <Checkbox
                                                checked={selectedPermissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                            />
                                            <div>
                                                <Label className="cursor-pointer mb-0">{perm.code}</Label>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-2 mt-8 lg:justify-end">
                            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(false)} type="button">
                                Hủy
                            </Button>
                            <Button size="sm" onClick={handleCreateOrUpdateRole} type="submit">
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
};

export default RoleManagement;
