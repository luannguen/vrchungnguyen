
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
// import { News } from "@/components/data/types"; // Type check later if needed


// Define DB type if it differs substantially from frontend type, 
// but for now relying on shared types or adapting locally.
// Actually, let's check types.ts first, but I will assume standard structure based on SQL.

export const newsService = {
    async getNews(categorySlug?: string): Promise<any[]> { // Using any[] temporarily until types are aligned
        let query = supabase
            .from('news')
            .select(`
                *,
                categories (
                    name,
                    slug
                )
            `)
            .order('publish_date', { ascending: false });

        if (categorySlug) {
            // This requires joining or filtering by category_id found from slug
            // Simplest is to fetch all or filter by category_id if passed. 
            // Changing arg to category_id might be better, but let's stick to simple select for now.
            // If categorySlug is needed, we need a refined query. 
            // For Admin Dashboard, usually we just need all list.
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching news:', error);
            throw error;
        }

        return data || [];
    },

    async getNewsById(id: string): Promise<any> {
        const { data, error } = await supabase
            .from('news')
            .select(`
                *,
                categories (
                    id,
                    name,
                    slug
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching news item:', error);
            throw error;
        }

        return data;
    },

    async createNews(news: any): Promise<any> {
        const newNews = {
            ...news,
            id: uuidv4(),
        };

        const { data, error } = await supabase
            .from('news')
            .insert([newNews])
            .select()
            .single();

        if (error) {
            console.error('Error creating news:', error);
            throw error;
        }

        return data;
    },

    async updateNews(id: string, updates: any): Promise<any> {
        const { data, error } = await supabase
            .from('news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating news:', error);
            throw error;
        }

        return data;
    },

    async deleteNews(id: string): Promise<void> {
        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting news:', error);
            throw error;
        }
    }
};
