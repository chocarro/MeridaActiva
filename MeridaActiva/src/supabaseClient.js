import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxciyspuzmmkigevlavp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_h0E4J5Zg2WlvAz2_VM4N_Q_sD8nX2fRç';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);