// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azblqhqlqazamthgywkq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6YmxxaHFscWF6YW10aGd5d2txIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODkxMTAsImV4cCI6MjA3Njg2NTExMH0.S0YZ40YykYCmnVDepellGIm4mP8m5EB9YHHqIbr0Jl4';
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
