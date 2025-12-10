import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bwsvuxyzxshrkxnvkrud.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c3Z1eHl6eHNocmt4bnZrcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjQwOTIsImV4cCI6MjA4MDIwMDA5Mn0.k-yAavb-Xt4BhlmCpkLh0_9VLA6BvMhPNNxmoApcdgg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false
    }
});

async function checkConnection() {
    console.log("1. Starting connection check...");
    console.time("Query Time");

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('count', { count: 'exact', head: true });

        console.timeEnd("Query Time");

        if (error) {
            console.error("❌ Error connecting to profiles:", error);
        } else {
            console.log("✅ Successfully connected to 'profiles'. Count:", data);
        }

        // Try to get a specific user role if we know an ID, or just select one
        console.log("2. Attempting to select one profile...");
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (profileError) {
            console.error("❌ Error fetching profile:", profileError);
        } else {
            console.log("✅ Fetched profile sample:", profile);
        }

    } catch (err) {
        console.error("❌ Unexpected error:", err);
    }
}

checkConnection();
