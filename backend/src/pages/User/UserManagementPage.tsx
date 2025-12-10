import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { userService } from "../../services/userService";
import { rbacService, Role } from "../../services/rbacService";
import { UserDTO } from "../../components/data/types";
// import { useAuth } from "../../context/AuthContext";

const UserManagementPage = () => {
    // const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Assign Role State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                userService.getAllUsers(),
                rbacService.getRoles()
            ]);

            if (usersRes.success) setUsers(usersRes.data);
            if (rolesRes.success) setRoles(rolesRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRoleId) return;

        try {
            const result = await rbacService.assignRoleToUser(selectedUser.id, selectedRoleId);

            if (result.success) {
                setMessage({ type: 'success', text: `Đã cập nhật vai trò cho ${selectedUser.fullName}` });
                setIsModalOpen(false);
                fetchData();

                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: (result as any).error || "Lỗi cập nhật" });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Không thể gán vai trò" });
        }
    };

    const openAssignContext = (user: UserDTO) => {
        setSelectedUser(user);
        const currentRole = roles.find(r => r.name === user.role);
        setSelectedRoleId(currentRole?.id || "");
        setIsModalOpen(true);
        setMessage(null);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý Người dùng</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Xem danh sách người dùng và phân quyền truy cập.</p>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-700">
                        <TableRow>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Người dùng</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Vai trò hiện tại</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Hành động</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">Đang tải...</TableCell>
                            </TableRow>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {user.avatarUrl ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">
                                                        {user.fullName?.charAt(0) || "U"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openAssignContext(user)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                                        >
                                            Phân vai trò
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-gray-500">Không tìm thấy người dùng nào</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md w-full p-6">
                <div className="mt-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white" id="modal-title">
                        Phân vai trò cho người dùng
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                            Chọn vai trò mới cho <strong>{selectedUser?.fullName}</strong>.
                        </p>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vai trò</label>
                        <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="" disabled>Chọn vai trò</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name} {(role.description) ? `- ${role.description}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={handleAssignRole}
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
