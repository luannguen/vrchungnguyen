import React from 'react';
import { UserDTO } from '@/components/data/types';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash, KeyRound } from 'lucide-react';

interface UserActionsProps {
    user: UserDTO;
    onEdit: (user: UserDTO) => void;
    onDelete: (user: UserDTO) => void;
    onResetPassword: (user: UserDTO) => void;
}

export const UserActions: React.FC<UserActionsProps> = ({ user, onEdit, onDelete, onResetPassword }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onResetPassword(user)}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Send Password Reset
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(user)} className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
