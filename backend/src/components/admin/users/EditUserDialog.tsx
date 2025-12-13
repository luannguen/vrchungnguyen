import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUser } from '@/features/users/useUser';
import { Role, rbacService, RoleDef } from '@/services/rbacService';
import { UserDTO } from '@/components/data/types';
import { toast } from 'sonner';

const editUserSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters'),
    role: z.string().min(1, 'Role is required'), // Changed to generic string
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
    user: UserDTO | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
    const { updateUser } = useUser();
    const [roles, setRoles] = useState<RoleDef[]>([]);

    const form = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            full_name: '',
            role: 'user',
        },
    });

    useEffect(() => {
        if (open) {
            loadRoles();
        }
    }, [open]);

    useEffect(() => {
        if (user && open) {
            form.reset({
                full_name: user.full_name || '',
                role: (user.role as Role) || 'user',
            });
        }
    }, [user, open, form]);

    const loadRoles = async () => {
        const result = await rbacService.getRoles();
        if (result.success) {
            setRoles(result.data || []);
        } else {
            toast.error('Failed to load roles');
        }
    };

    const onSubmit = async (data: EditUserFormValues) => {
        if (!user) return;
        try {
            await updateUser.mutateAsync({
                id: user.id,
                data: {
                    full_name: data.full_name,
                    role: data.role as Role,
                },
            });
            toast.success('User updated successfully');
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={updateUser.isPending}>
                                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
