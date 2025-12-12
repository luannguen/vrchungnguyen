import { supabase } from './supabase';
import { Result, success, failure, ErrorCodes } from '../components/data/types';

export interface Service {
    id: string;
    slug: string;
    title: string;
    description: string;
    content: string;
    icon: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}

export const serviceService = {
    async getServices(): Promise<Result<Service[]>> {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            return success(data || []);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    },

    async getServiceBySlug(slug: string): Promise<Result<Service>> {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            if (!data) return failure('Service not found', ErrorCodes.NOT_FOUND);

            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    }
};
