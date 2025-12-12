import { supabase } from '@/supabase';
import { TeamMember, Result, ErrorCodes, failure, success } from '@/components/data/types';

export const teamService = {
    async getAll(): Promise<Result<TeamMember[]>> {
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                console.error('Error fetching team members:', error);
                return failure(error.message, ErrorCodes.DB_ERROR);
            }

            return success(data || []);
        } catch (err: any) {
            return failure(err.message || 'Unknown error', ErrorCodes.UNKNOWN_ERROR);
        }
    }
};
