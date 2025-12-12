
import { supabase } from "@/lib/supabase";
import { Event } from "@/components/data/types";
import { v4 as uuidv4 } from 'uuid';

export const eventService = {
    async getEvents(): Promise<Event[]> {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Error fetching events:', error);
            throw error;
        }

        return data || [];
    },

    async getEventById(id: string): Promise<Event | null> {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching event:', error);
            throw error;
        }

        return data;
    },

    async createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
        const newEvent = {
            ...event,
            id: uuidv4(),
        };

        const { data, error } = await supabase
            .from('events')
            .insert([newEvent])
            .select()
            .single();

        if (error) {
            console.error('Error creating event:', error);
            throw error;
        }

        return data;
    },

    async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating event:', error);
            throw error;
        }

        return data;
    },

    async deleteEvent(id: string): Promise<void> {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
};
