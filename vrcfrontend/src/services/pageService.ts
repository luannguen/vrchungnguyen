
import { supabase } from './supabase';

export interface StaticPage {
    id: string;
    slug: string;
    title: string;
    content: string | null;
    excerpt: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const pageService = {
    async getPageBySlug(slug: string) {
        const { data, error } = await supabase
            .from('static_pages')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) throw error;
        return data as StaticPage;
    },

    async getAllPages() {
        const { data, error } = await supabase
            .from('static_pages')
            .select('id, title, slug')
            .eq('is_active', true)
            .order('title');

        if (error) throw error;
        return data as Pick<StaticPage, 'id' | 'title' | 'slug'>[];
    }
};
