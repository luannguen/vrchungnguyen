import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

const SUPABASE_URL = 'https://bwsvuxyzxshrkxnvkrud.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c3Z1eHl6eHNocmt4bnZrcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjQwOTIsImV4cCI6MjA4MDIwMDA5Mn0.k-yAavb-Xt4BhlmCpkLh0_9VLA6BvMhPNNxmoApcdgg';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
