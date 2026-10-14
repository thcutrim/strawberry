import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://juksgyfgqtyignkethwn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YEpe9Wj2pelILuS9liEwFw_802CevW3';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
});
