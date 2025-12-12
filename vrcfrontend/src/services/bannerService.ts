
import { supabase } from '@/services/supabase';
import { Result, success, failure, ErrorCodes } from '@/components/data/types';

export interface Banner {
    id: string;
    title: string | null;
    image_url: string;
    link: string | null;
    description: string | null;
    position: 'home_main' | 'popup' | 'sidebar' | string;
    order_index: number;
    is_active: boolean;
}

export const bannerService = {
    async getBanners(position?: string): Promise<Result<Banner[]>> {
        try {
            let query = supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (position) {
                query = query.eq('position', position);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase error fetching banners:', error);
                return failure(error.message, ErrorCodes.DB_ERROR, error);
            }

            return success(data as Banner[]);
        } catch (err: any) {
            console.error('Unexpected error fetching banners:', err);
            return failure(err.message || 'Unknown error', ErrorCodes.UNKNOWN_ERROR, err);
        }
    }
};
