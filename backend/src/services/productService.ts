import { supabase } from '../supabase';
import { Database } from '../types/database.types';
import { Result, success, failure, ErrorCodes } from '../components/data/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export const productService = {
    /**
     * Get all products (with optional filtering)
     */
    getAll: async (onlyPublished: boolean = true): Promise<Result<Product[]>> => {
        try {
            let query = supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (onlyPublished) {
                query = query.eq('is_published', true);
            }

            const { data, error } = await query;

            if (error) {
                return failure(error.message, ErrorCodes.SERVER_ERROR);
            }

            return success(data || []);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Get product by ID
     */
    getById: async (id: string): Promise<Result<Product>> => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                return failure(error.message, ErrorCodes.NOT_FOUND);
            }

            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Create new product
     */
    create: async (product: ProductInsert): Promise<Result<Product>> => {
        try {
            const { data, error } = await supabase
                .from('products')
                .insert(product as any)
                .select()
                .single();

            if (error) {
                return failure(error.message, ErrorCodes.SERVER_ERROR);
            }

            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Update product
     */
    update: async (id: string, updates: ProductUpdate): Promise<Result<Product>> => {
        try {
            const { data, error } = await supabase
                .from('products')
                .update(updates as any)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                return failure(error.message, ErrorCodes.SERVER_ERROR);
            }

            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    },

    /**
     * Delete product
     */
    delete: async (id: string): Promise<Result<void>> => {
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                return failure(error.message, ErrorCodes.SERVER_ERROR);
            }

            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.SERVER_ERROR);
        }
    }
};
