const dotenv = require("dotenv");
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.DB_URL;
const supabaseKey = process.env.DB_KEY;
const db = createClient(supabaseUrl, supabaseKey);



module.exports = db;

