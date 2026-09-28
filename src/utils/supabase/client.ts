import { createBrowserClient } from '@supabase/ssr';

export const getSupabaseUrl = (): string =>
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  'https://ksjxxeyebbdendorbzlu.supabase.co';

export const getSupabaseKey = (): string =>
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_4TV6BcIMbjMYNu5gxwvDGg_zodymUV-';

export const createClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabaseKey());
