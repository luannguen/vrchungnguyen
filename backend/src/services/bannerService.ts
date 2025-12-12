
import { supabase } from '@/lib/supabase';

export interface Banner {
    id: string;
    title: string | null;
    image_url: string;
    link: string | null;
    description: string | null;
    position: 'home_main' | 'popup' | 'sidebar' | string;
    order_index: number;
    is_active: boolean;
    created_at: string;
}

export type BannerFormData = Omit<Banner, 'id' | 'created_at'>;

export const bannerService = {
    async getBanners(position?: string) {
        let query = supabase
            .from('banners')
            .select('*')
            .order('order_index', { ascending: true });

        if (position) {
            query = query.eq('position', position);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Banner[];
    },

    async createBanner(banner: BannerFormData) {
        const { data, error } = await supabase
            .from('banners')
            .insert(banner)
            .select()
            .single();

        if (error) throw error;
        return data as Banner;
    },

    async updateBanner(id: string, updates: Partial<BannerFormData>) {
        const { data, error } = await supabase
            .from('banners')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Banner;
    },

    async deleteBanner(id: string) {
        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async reorderBanners(items: { id: string; order_index: number }[]) {
        // This relies on Supabase allowing upsert or iterating updates.
        // For simplicity, iterating updates.
        for (const item of items) {
            await supabase
                .from('banners')
                .update({ order_index: item.order_index })
                .eq('id', item.id);
        }
        return true;
    }
};
