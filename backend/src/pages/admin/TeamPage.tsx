import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teamService } from '@/services/teamService';
import { TeamMember } from '@/components/data/types';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import TeamForm from '@/components/admin/team/TeamForm';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const TeamPage = () => {
    const { t } = useTranslation();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingMember, setEditingMember] = useState<TeamMember | undefined>(undefined);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await teamService.getAll();
            setMembers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingMember(undefined);
        setView('form');
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setView('form');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('confirm_delete_member'))) return;
        try {
            await teamService.delete(id);
            await loadMembers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (data: Partial<TeamMember>) => {
        try {
            if (editingMember) {
                await teamService.update(editingMember.id, data);
            } else {
                await teamService.create(data);
            }
            setView('list');
            loadMembers();
        } catch (error) {
            console.error(error);
        }
    };

    if (view === 'form') {
        return (
            <div className="max-w-4xl mx-auto">
                <TeamForm
                    initialData={editingMember}
                    onSave={handleSave}
                    onCancel={() => setView('list')}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('team_management')}</h1>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('add_member')}
                </Button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead>{t('avatar')}</TableHead>
                            <TableHead>{t('name')}</TableHead>
                            <TableHead>{t('role')}</TableHead>
                            <TableHead>{t('order')}</TableHead>
                            <TableHead className="text-right">{t('actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">{t('loading')}</TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">{t('no_team_members')}</TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                            {member.image_url ? (
                                                <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>{member.display_order}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default TeamPage;
