import { supabase } from "@/lib/supabase";
import { NavigationItem, Result, success, failure } from "@/components/data/types";

export const navigationService = {
    async getNavigationItems(): Promise<Result<NavigationItem[]>> {
        try {
            const { data, error } = await supabase
                .from('navigation')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            return success(data as NavigationItem[]);
        } catch (error) {
            console.error('Error fetching navigation:', error);
            return failure('Failed to fetch navigation items');
        }
    },

    async createNavigationItem(item: Partial<NavigationItem>): Promise<Result<NavigationItem>> {
        try {
            const { data, error } = await supabase
                .from('navigation')
                .insert([item])
                .select()
                .single();

            if (error) throw error;
            return success(data as NavigationItem);
        } catch (error) {
            console.error('Error creating navigation item:', error);
            return failure('Failed to create navigation item');
        }
    },

    async updateNavigationItem(id: string, updates: Partial<NavigationItem>): Promise<Result<NavigationItem>> {
        try {
            const { data, error } = await supabase
                .from('navigation')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return success(data as NavigationItem);
        } catch (error) {
            console.error('Error updating navigation item:', error);
            return failure('Failed to update navigation item');
        }
    },

    async deleteNavigationItem(id: string): Promise<Result<void>> {
        try {
            const { error } = await supabase
                .from('navigation')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return success(undefined);
        } catch (error) {
            console.error('Error deleting navigation item:', error);
            return failure('Failed to delete navigation item');
        }
    },

    async reorderItems(items: { id: string; order_index: number }[]): Promise<Result<void>> {
        try {
            // Use upsert or multiple updates. For stability, loop updates roughly fine for small menu
            // Supabase supports upsert if PK provided
            const { error } = await supabase
                .from('navigation')
                .upsert(items.map(i => ({ id: i.id, order_index: i.order_index, updated_at: new Date().toISOString() }))); // Only updating order_index might require providing other non-nulls? 
            // Actually upsert needs all required fields if it was insert, but for update it works if PK matches? 
            // Supabase upsert: "If a row with the same primary key exists, it updates the row."
            // But if there are other NOT NULL columns without default, it requires them? No, only for insert.
            // But wait, if partial update, upsert works?
            // "For an update, you only need to provide the primary key and the columns you want to update." <- Check documentation memory.
            // Usually passing just ID and one field works if row exists.

            if (error) throw error;
            return success(undefined);
        } catch (error) {
            console.error('Error reordering items:', error);
            return failure('Failed to reorder items');
        }
    }
};
