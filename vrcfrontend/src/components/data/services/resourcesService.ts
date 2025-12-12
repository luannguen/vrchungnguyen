import { supabase } from "@/services/supabase";

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

export interface Result<T> {
    success: boolean;
    data?: T;
    error?: { message: string };
}

export const resourceAPI = {
    async getAll(): Promise<Result<Resource[]>> {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error: any) {
            return { success: false, error: { message: error.message } };
        }
    },

    async getBySlug(slug: string): Promise<Result<Resource>> {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: { message: error.message } };
        }
    },

    async getChildren(parentId: string): Promise<Result<Resource[]>> {
        try {
            const { data, error } = await supabase
                .from('resources')
                .select('*')
                .eq('parent_id', parentId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error: any) {
            return { success: false, error: { message: error.message } };
        }
    },

    async create(resource: Omit<Resource, 'id' | 'created_at'>): Promise<Result<Resource>> {
        try {
            const { data, error } = await supabase
                .from('resources')
                .insert([resource])
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: { message: error.message } };
        }
    },

    async update(id: string, resource: Partial<Resource>): Promise<Result<Resource>> {
        try {
            const { data, error } = await supabase
                .from('resources')
                .update(resource)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: { message: error.message } };
        }
    },

    async delete(id: string): Promise<Result<boolean>> {
        try {
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true, data: true };
        } catch (error: any) {
            return { success: false, error: { message: error.message } };
        }
    }
};
