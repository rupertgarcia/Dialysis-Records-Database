import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder strings so createClient doesn't throw at build time.
// Actual requests will fail gracefully until .env.local is configured.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hyckasbibeuaegvbkwnx.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y2thc2JpYmV1YWVndmJrd254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDg4ODIsImV4cCI6MjA5NTA4NDg4Mn0.AxdumqcQHfhFsCNhXwmA1LW5r_aWCWNIgii3ZoJBzEI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
