import { userService, UsersFilter } from '@/services/userService';
import { CreateUserDTO, UpdateUserDTO } from '@/components/data/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useUser() {
    const queryClient = useQueryClient();

    // Fetch Users Query
    const useUsers = (filters: UsersFilter) => {
        return useQuery({
            queryKey: ['users', filters],
            queryFn: () => userService.getUsers(filters),
        });
    };

    // Create User Mutation
    const createUserMutation = useMutation({
        mutationFn: (data: CreateUserDTO) => userService.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Update User Mutation
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) => userService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Delete User Mutation
    const deleteUserMutation = useMutation({
        mutationFn: (id: string) => userService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    // Reset Password (Admin triggered)
    // Note: Ideally sending a reset link is done via authService, but logic might vary.
    // For now, we assume implicit handling or manual email trigger if backend existed.
    // Since we are client-side only, we might trigger the "Forgot Password" flow for the email?
    // Supabase Admin API has inviteUserByEmail but we are client-side.
    // We will skip explicit admin-trigger-reset logic here unless we use a function.
    // Reverting to manually using authService.resetPasswordForEmail if needed in UI.

    return {
        useUsers,
        createUser: createUserMutation,
        updateUser: updateUserMutation,
        deleteUser: deleteUserMutation,
    };
}
