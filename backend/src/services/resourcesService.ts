import { supabase } from "@/lib/supabase";

export interface Resource {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    features: string[];
    created_at?: string;
    slug?: string;
    parent_id?: string | null;
    content?: string | null;
    type?: 'category' | 'tool' | 'article' | 'service';
}

export const resourceService = {
    async getAll(): Promise<Resource[]> {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching resources:', error);
            throw error;
        }

        return data || [];
    },

    async getBySlug(slug: string): Promise<Resource | null> {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error(`Error fetching resource with slug ${slug}:`, error);
            return null;
        }

        return data;
    },

    async getChildren(parentId: string): Promise<Resource[]> {
        const { data, error } = await supabase
            .from('resources')
            .select('*')
            .eq('parent_id', parentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error(`Error fetching children for resource ${parentId}:`, error);
            throw error;
        }

        return data || [];
    },

    async create(resource: Omit<Resource, 'id' | 'created_at'>): Promise<Resource> {
        const { data, error } = await supabase
            .from('resources')
            .insert([resource])
            .select()
            .single();

        if (error) {
            console.error('Error creating resource:', error);
            throw error;
        }

        return data;
    },

    async update(id: string, resource: Partial<Resource>): Promise<Resource> {
        const { data, error } = await supabase
            .from('resources')
            .update(resource)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating resource:', error);
            throw error;
        }

        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting resource:', error);
            throw error;
        }
    }
};
