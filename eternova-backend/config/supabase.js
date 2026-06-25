const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Using service role key for backend admin access

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. URL:', !!supabaseUrl, 'KEY:', !!supabaseKey, 'KEYS:', Object.keys(process.env).filter(k => k.includes('SUPA')));
    // process.exit(1); // Removed for debugging
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = supabase;
