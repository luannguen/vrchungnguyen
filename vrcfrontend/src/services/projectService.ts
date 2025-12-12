import { supabase } from "./supabase";
import { Project, Category, Result, success, failure, ErrorCodes } from "@/components/data/types";

// Helper to handle Supabase errors
const handleSupabaseError = (error: any, context: string): Result<any> => {
    console.error(`ProjectService Error [${context}]:`, error);
    return failure(error.message || `Failed to ${context}`, ErrorCodes.DB_ERROR);
};

export const projectService = {
    // PROJECTS
    getProjects: async ({ categoryId, search, featured, limit }: { categoryId?: string; search?: string; featured?: boolean; limit?: number } = {}): Promise<Result<Project[]>> => {
        try {
            let query = supabase
                .from('projects')
                .select('*, category:categories(name, slug)')
                .order('completion_date', { ascending: false });

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            if (featured !== undefined) {
                query = query.eq('is_featured', featured);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) return handleSupabaseError(error, 'fetch projects');
            return success(data as Project[]);
        } catch (err) {
            return handleSupabaseError(err, 'fetch projects');
        }
    },

    getProject: async (idOrSlug: string): Promise<Result<Project>> => {
        try {
            // Check if input looks like a UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

            const column = isUuid ? 'id' : 'slug';

            const { data, error } = await supabase
                .from('projects')
                .select('*, category:categories(*)')
                .eq(column, idOrSlug)
                .single();

            if (error) return handleSupabaseError(error, 'fetch project');
            if (!data) return failure('Project not found', ErrorCodes.NOT_FOUND);

            return success(data as Project);
        } catch (err) {
            return handleSupabaseError(err, 'fetch project');
        }
    }
};
