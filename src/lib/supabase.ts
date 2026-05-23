import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder strings so createClient doesn't throw at build time.
// Actual requests will fail gracefully until .env.local is configured.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
