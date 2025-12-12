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

    async reorderItems(items: Partial<NavigationItem>[]): Promise<Result<void>> {
        try {
            // Use upsert to update multiple items. 
            // We expect 'items' to contain all required fields (like label, path) to avoid NOT NULL constraint violations if the DB treats it as an insert attempt.
            // Sanitize items to remove non-DB columns like 'children'
            // Also removing 'updated_at' as the log confirmed it does not exist in the schema
            const validItems = items.map(({ children, ...rest }) => ({
                ...rest
            }));

            const { error } = await supabase
                .from('navigation')
                .upsert(validItems);

            if (error) throw error;
            return success(undefined);
        } catch (error) {
            console.error('Error reordering items:', error);
            return failure('Failed to reorder items');
        }
    }
};
