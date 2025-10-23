// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yptaernslfzaewkdaofy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdGFlcm5zbGZ6YWV3a2Rhb2Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMTU0NTcsImV4cCI6MjA3NTc5MTQ1N30.nA53Ci_0McjE--0ii-0qXwmn-YMLwc3X_mVAPPSeUyI';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
