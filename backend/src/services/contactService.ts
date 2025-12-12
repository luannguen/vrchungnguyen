
import { supabase } from '@/lib/supabase';

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message?: string;
    status: 'new' | 'read' | 'replied';
    created_at: string;
    updated_at: string;
}

export type CreateContactInput = Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'status'>;
export type UpdateContactStatusInput = { status: Contact['status'] };

export const contactService = {
    // Public: Create a new contact (submission form)
    async createContact(contact: CreateContactInput) {
        const { data, error } = await supabase
            .from('contacts')
            .insert([contact])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    },

    // Admin: Get all contacts with filters
    async getContacts(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
        let query = supabase
            .from('contacts')
            .select('*', { count: 'exact' });

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
        }

        // Pagination
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        query = query.order('created_at', { ascending: false }).range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;
        return { success: true, data, count };
    },

    // Admin: Get single contact
    async getContactById(id: string) {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    },

    // Admin: Update status
    async updateContactStatus(id: string, status: Contact['status']) {
        const { data, error } = await supabase
            .from('contacts')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    },

    // Admin: Delete contact
    async deleteContact(id: string) {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }
};
