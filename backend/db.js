const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ CRITICAL DATABASE ERROR: Supabase credentials missing in backend/.env");
  process.exit(1);
}

// Initialize the cloud database instance
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("⚡ CLOUD DATABASE GATEWAY INITIALIZED (Supabase/PostgreSQL)");

module.exports = supabase;