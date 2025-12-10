import { supabase } from '../supabase';
import { Database } from '../types/database.types';
import { Result, success, failure, ErrorCodes } from '../components/data/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

type CmsPage = Database['public']['Tables']['cms_pages']['Row'];
type CmsPageUpdate = Database['public']['Tables']['cms_pages']['Update'];

export const cmsContentService = {
    // ==============================================================================
    // Categories
    // ==============================================================================

    getAllCategories: async (type?: string): Promise<Result<Category[]>> => {
        try {
            let query = supabase
                .from('categories')
                .select('*')
                .order('name');

            if (type) {
                query = query.eq('type', type);
            }

            const { data, error } = await query;
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data || []);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    createCategory: async (category: CategoryInsert): Promise<Result<Category>> => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert(category as any)
                .select()
                .single();
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data!);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    updateCategory: async (id: string, updates: CategoryUpdate): Promise<Result<Category>> => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(updates as any)
                .eq('id', id)
                .select()
                .single();
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data!);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    deleteCategory: async (id: string): Promise<Result<void>> => {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    // ==============================================================================
    // Static Pages (CMS)
    // ==============================================================================

    getPageBySlug: async (slug: string): Promise<Result<CmsPage>> => {
        try {
            const { data, error } = await supabase
                .from('cms_pages')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) return failure(error.message, ErrorCodes.NOT_FOUND);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    updatePage: async (id: string, updates: CmsPageUpdate): Promise<Result<CmsPage>> => {
        try {
            const { data, error } = await supabase
                .from('cms_pages')
                .update(updates as any)
                .eq('id', id)
                .select()
                .single();

            if (error) return failure(error.message, ErrorCodes.SERVER_ERROR);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    }
};
