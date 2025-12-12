
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface MediaItem {
    name: string;
    id: string; // usually name or path
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: Record<string, any>;
    url: string;
    path: string;
}

const BUCKET_NAME = 'media';

export const mediaService = {
    async uploadImage(file: File, folder: string = 'uploads'): Promise<{ url: string; path: string } | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            return { url: data.publicUrl, path: filePath };
        } catch (error) {
            console.error('Error in uploadImage:', error);
            throw error;
        }
    },

    async getImages(folder: string = 'uploads'): Promise<MediaItem[]> {
        try {
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .list(folder, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) {
                console.error('Error listing images:', error);
                throw error;
            }

            // Get public URL for each item
            const itemsWithUrls = data.map((item) => {
                const { data: publicUrlData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(`${folder}/${item.name}`);

                return {
                    ...item,
                    url: publicUrlData.publicUrl,
                    path: `${folder}/${item.name}` // helper for deletion
                };
            });

            return itemsWithUrls as unknown as MediaItem[];
        } catch (error) {
            console.error('Error in getImages:', error);
            throw error;
        }
    },

    async deleteImage(path: string): Promise<boolean> {
        try {
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([path]);

            if (error) {
                console.error('Error deleting image:', error);
                throw error;
            }
            return true;
        } catch (error) {
            console.error('Error in deleteImage:', error);
            throw error;
        }
    }
};
