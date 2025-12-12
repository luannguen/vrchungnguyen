import { supabase } from '@/lib/supabase';
import { TeamMember, Result, ErrorCodes, success, failure } from '@/components/data/types';

export const teamService = {
    async getAll(): Promise<TeamMember[]> {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching team members:', error);
            throw error;
        }

        return data || [];
    },

    async getById(id: string): Promise<TeamMember | null> {
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(member: Partial<TeamMember>): Promise<Result<TeamMember>> {
        const { data, error } = await supabase
            .from('team_members')
            .insert([member])
            .select()
            .single();

        if (error) {
            console.error('Error creating team member:', error);
            return failure(error.message, ErrorCodes.DB_ERROR);
        }

        return success(data);
    },

    async update(id: string, member: Partial<TeamMember>): Promise<Result<TeamMember>> {
        const { data, error } = await supabase
            .from('team_members')
            .update(member)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating team member:', error);
            return failure(error.message, ErrorCodes.DB_ERROR);
        }

        return success(data);
    },

    async delete(id: string): Promise<Result<void>> {
        const { error } = await supabase
            .from('team_members')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting team member:', error);
            return failure(error.message, ErrorCodes.DB_ERROR);
        }

        return success(undefined);
    },

    async updateOrder(items: { id: string; display_order: number }[]): Promise<Result<void>> {
        // Supabase doesn't support bulk update easily in one go for different values without a function
        // For simplicity with few items, we loop (optimizable later with RPC)
        const updates = items.map(item =>
            supabase.from('team_members').update({ display_order: item.display_order }).eq('id', item.id)
        );

        const results = await Promise.all(updates);
        const hasError = results.some(r => r.error);

        if (hasError) {
            return failure('Failed to update some orders', ErrorCodes.DB_ERROR);
        }

        return success(undefined);
    }
};
