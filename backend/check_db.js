
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwsvuxyzxshrkxnvkrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c3Z1eHl6eHNocmt4bnZrcnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MjQwOTIsImV4cCI6MjA4MDIwMDA5Mn0.k-yAavb-Xt4BhlmCpkLh0_9VLA6BvMhPNNxmoApcdgg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log("Checking connection to Supabase...");

    // 1. Check simple connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) console.error("❌ DB Connection Check Failed:", error.message);
    else console.log("✅ DB Connection OK. Profiles count:", data);

    // 2. Try Admin Login (New Account)
    console.log("--------------------------------");
    console.log("Attempting to Sign In with NEW Admin...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'nguyenzeroluan@gmail.com',
        password: 'admin1234', // Assuming user used this
    });

    if (authError) {
        console.error("❌ Sign In FAILED:", JSON.stringify(authError, null, 2));
    } else {
        console.log("✅ Sign In SUCCEEDED!");
        console.log("   User ID:", authData.user.id);
        console.log("   Email:", authData.user.email);
        console.log("   Role (from Metadata):", authData.user.user_metadata?.role || 'N/A');

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
        console.log("   Role (from DB Profile):", profile?.role);
    }
}

checkDatabase();
