import { supabase } from "@/lib/supabase";
import { Product, Category, Result, success, failure, ErrorCodes } from "@/components/data/types";

// Helper to handle Supabase errors
const handleSupabaseError = (error: any, context: string): Result<any> => {
    console.error(`ProductService Error [${context}]:`, error);
    return failure(error.message || `Failed to ${context}`, ErrorCodes.DB_ERROR);
};

export const productService = {
    // CATEGORIES
    getCategories: async (): Promise<Result<Category[]>> => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('type', 'product')
                .order('name');

            if (error) return handleSupabaseError(error, 'fetch product categories');
            return success(data as Category[]);
        } catch (err) {
            return handleSupabaseError(err, 'fetch product categories');
        }
    },

    // PRODUCTS
    getProducts: async ({ categoryId, search }: { categoryId?: string; search?: string } = {}): Promise<Result<Product[]>> => {
        try {
            let query = supabase
                .from('products')
                .select('*, category:categories(name, slug)')
                .order('created_at', { ascending: false });

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            if (search) {
                query = query.ilike('name', `%${search}%`);
            }

            const { data, error } = await query;
            if (error) return handleSupabaseError(error, 'fetch products');
            return success(data as Product[]);
        } catch (err) {
            return handleSupabaseError(err, 'fetch products');
        }
    },

    getProduct: async (idOrSlug: string): Promise<Result<Product>> => {
        try {
            // Check if input looks like a UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

            const column = isUuid ? 'id' : 'slug';

            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq(column, idOrSlug)
                .single();

            if (error) return handleSupabaseError(error, 'fetch product');
            if (!data) return failure('Product not found', ErrorCodes.NOT_FOUND);

            return success(data as Product);
        } catch (err) {
            return handleSupabaseError(err, 'fetch product');
        }
    },

    createProduct: async (product: Partial<Product>): Promise<Result<Product>> => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([product])
                .select()
                .single();

            if (error) return handleSupabaseError(error, 'create product');
            return success(data as Product);
        } catch (err) {
            return handleSupabaseError(err, 'create product');
        }
    },

    updateProduct: async (id: string, updates: Partial<Product>): Promise<Result<Product>> => {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return handleSupabaseError(error, 'update product');
            return success(data as Product);
        } catch (err) {
            return handleSupabaseError(err, 'update product');
        }
    },

    deleteProduct: async (id: string): Promise<Result<void>> => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) return handleSupabaseError(error, 'delete product');
            return success(undefined);
        } catch (err) {
            return handleSupabaseError(err, 'delete product');
        }
    }
};
