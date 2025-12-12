import { supabase } from "./supabase";
import { SiteSetting, Result, success, failure } from "@/components/data/types";

export const settingsService = {
    async getSettings(): Promise<Result<Record<string, string>>> {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*');

            if (error) throw error;

            // Convert array to object key-value map for easier usage
            const settingsMap: Record<string, string> = {};
            (data as SiteSetting[]).forEach(item => {
                settingsMap[item.key] = item.value;
            });

            return success(settingsMap);
        } catch (error) {
            console.error('Error fetching settings:', error);
            return failure('Failed to fetch site settings');
        }
    },

    async getSetting(key: string): Promise<Result<string>> {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', key)
                .single();

            if (error) throw error;

            return success(data.value);
        } catch (error) {
            console.error(`Error fetching setting ${key}:`, error);
            return failure(`Failed to fetch setting ${key}`);
        }
    }
};
