import { supabase } from '../lib/supabase';
import { Result } from '../components/data/types';

export interface Achievement {
    id: string;
    label: string;
    value: string;
    icon?: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
}

export const contentService = {
    // --- ACHIEVEMENTS ---

    async getAllAchievements(): Promise<Result<Achievement[]>> {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return { success: true, data: data as Achievement[] };
        } catch (error: any) {
            console.error('Error fetching achievements:', error);
            return { success: false, error: error.message || 'Failed to fetch achievements' };
        }
    },

    async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at'>): Promise<Result<Achievement>> {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .insert([achievement])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as Achievement };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    async updateAchievement(id: string, updates: Partial<Achievement>): Promise<Result<Achievement>> {
        try {
            const { data, error } = await supabase
                .from('achievements')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as Achievement };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    async deleteAchievement(id: string): Promise<Result<void>> {
        try {
            const { error } = await supabase
                .from('achievements')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true, data: undefined };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    // --- FAQS ---

    async getAllFAQs(category?: string): Promise<Result<FAQ[]>> {
        try {
            let query = supabase
                .from('faqs')
                .select('*')
                .order('sort_order', { ascending: true });

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            if (error) throw error;
            return { success: true, data: data as FAQ[] };
        } catch (error: any) {
            console.error('Error fetching FAQs:', error);
            return { success: false, error: error.message || 'Failed to fetch FAQs' };
        }
    },

    async createFAQ(faq: Omit<FAQ, 'id' | 'created_at'>): Promise<Result<FAQ>> {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .insert([faq])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as FAQ };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    async updateFAQ(id: string, updates: Partial<FAQ>): Promise<Result<FAQ>> {
        try {
            const { data, error } = await supabase
                .from('faqs')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data: data as FAQ };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    },

    async deleteFAQ(id: string): Promise<Result<void>> {
        try {
            const { error } = await supabase
                .from('faqs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true, data: undefined };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
};
