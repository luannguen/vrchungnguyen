import { supabase } from '@/services/supabase';
import { Result, success, failure, ErrorCodes } from '@/components/data/types';

export interface ContactDTO {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export const contactService = {
    async createContact(contact: ContactDTO): Promise<Result<any>> {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .insert([{
                    ...contact,
                    status: 'new'
                }]);

            // Note: We do NOT use .select() here because anonymous users 
            // do not have SELECT permissions on the contacts table for security.
            // We just need to know if the insert was successful (no error).

            if (error) {
                console.error('Supabase error:', error);
                return failure(error.message, ErrorCodes.DB_ERROR, error);
            }
            return success({ message: "Contact submitted successfully" });
        } catch (err: any) {
            console.error('Unexpected error:', err);
            return failure(err.message || 'Unknown error', ErrorCodes.UNKNOWN_ERROR, err);
        }
    }
};
