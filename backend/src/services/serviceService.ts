import { supabase } from '@/lib/supabase';
import { Result, success, failure, ErrorCodes } from '@/components/data/types';

export interface Service {
    id: string;
    slug: string;
    title: string;
    description: string;
    content: string;
    icon: string;
    image_url?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type CreateServiceDTO = Omit<Service, 'id' | 'created_at' | 'updated_at'>;
export type UpdateServiceDTO = Partial<CreateServiceDTO>;

export const serviceService = {
    async getServices(): Promise<Result<Service[]>> {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            return success(data || []);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    },

    async getService(id: string): Promise<Result<Service>> {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    },

    async createService(service: CreateServiceDTO): Promise<Result<Service>> {
        try {
            const { data, error } = await supabase
                .from('services')
                .insert([service])
                .select()
                .single();

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    },

    async updateService(id: string, updates: UpdateServiceDTO): Promise<Result<Service>> {
        try {
            const { data, error } = await supabase
                .from('services')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            return success(data);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    },

    async deleteService(id: string): Promise<Result<void>> {
        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) return failure(error.message, ErrorCodes.DB_ERROR, error);
            return success(undefined);
        } catch (err: any) {
            return failure(err.message, ErrorCodes.UNKNOWN_ERROR, err);
        }
    }
};
