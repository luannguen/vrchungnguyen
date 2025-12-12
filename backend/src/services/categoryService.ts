
import { supabase } from "@/lib/supabase";
import { Category } from "@/components/data/types";
import { v4 as uuidv4 } from 'uuid';

export const categoryService = {
    async getCategories(type?: 'news' | 'product' | 'project' | 'event'): Promise<Category[]> {
        let query = supabase
            .from('categories')
            .select('*')
            .order('name');

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }

        return data || [];
    },

    async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
        const newCategory = {
            ...category,
            id: uuidv4(),
        };

        const { data, error } = await supabase
            .from('categories')
            .insert([newCategory])
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            throw error;
        }

        return data;
    },

    async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating category:', error);
            throw error;
        }

        return data;
    },

    async deleteCategory(id: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }
};
