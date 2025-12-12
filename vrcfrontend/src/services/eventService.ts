import { supabase } from "./supabase";
import { Event, Category, Result, success, failure, ErrorCodes } from "@/components/data/types";

// Helper to handle Supabase errors
const handleSupabaseError = (error: any, context: string): Result<any> => {
    console.error(`EventService Error [${context}]:`, error);
    return failure(error.message || `Failed to ${context}`, ErrorCodes.DB_ERROR);
};

export const eventService = {
    // EVENTS
    getEvents: async ({ categoryId, search, status, limit }: { categoryId?: string; search?: string; status?: string; limit?: number } = {}): Promise<Result<Event[]>> => {
        try {
            let query = supabase
                .from('events')
                .select('*, category:categories(name, slug)')
                .order('start_date', { ascending: true }); // Upcoming events usually ordered by date asc

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            }

            if (search) {
                query = query.ilike('title', `%${search}%`);
            }

            if (status) {
                query = query.eq('status', status);
            }

            if (limit) {
                query = query.limit(limit);
            }

            const { data, error } = await query;
            if (error) return handleSupabaseError(error, 'fetch events');
            return success(data as Event[]);
        } catch (err) {
            return handleSupabaseError(err, 'fetch events');
        }
    },

    getEvent: async (idOrSlug: string): Promise<Result<Event>> => {
        try {
            // Check if input looks like a UUID
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

            const column = isUuid ? 'id' : 'slug';

            const { data, error } = await supabase
                .from('events')
                .select('*, category:categories(*)')
                .eq(column, idOrSlug)
                .single();

            if (error) return handleSupabaseError(error, 'fetch event');
            if (!data) return failure('Event not found', ErrorCodes.NOT_FOUND);

            return success(data as Event);
        } catch (err) {
            return handleSupabaseError(err, 'fetch event');
        }
    },

    getFeaturedEvent: async (): Promise<Result<Event>> => {
        try {
            // Logic for featured event, for now just get the next upcoming one
            const { data, error } = await supabase
                .from('events')
                .select('*, category:categories(*)')
                .eq('status', 'upcoming')
                .order('start_date', { ascending: true })
                .limit(1)
                .single();

            // If no upcoming, maybe get latest
            if (error || !data) {
                const { data: latest, error: latError } = await supabase
                    .from('events')
                    .select('*, category:categories(*)')
                    .order('start_date', { ascending: false })
                    .limit(1)
                    .single();
                if (latError) return handleSupabaseError(latError, 'fetch featured event');
                if (!latest) return failure('No events found', ErrorCodes.NOT_FOUND);
                return success(latest as Event);
            }

            return success(data as Event);
        } catch (err) {
            return handleSupabaseError(err, 'fetch featured event');
        }
    }
};
