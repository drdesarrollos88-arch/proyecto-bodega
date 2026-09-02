import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Claves por defecto o leídas desde variables de entorno
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Permitir guardar credenciales de prueba en localStorage para conexión dinámica desde la UI
const savedUrl = localStorage.getItem('bodega_supabase_url') || envUrl;
const savedKey = localStorage.getItem('bodega_supabase_key') || envKey;

let supabaseClient: SupabaseClient | null = null;

if (savedUrl && savedKey && savedUrl.startsWith('http')) {
  try {
    supabaseClient = createClient(savedUrl, savedKey);
  } catch (error) {
    console.warn('Error inicializando cliente Supabase:', error);
  }
}

export const getSupabase = (): SupabaseClient | null => supabaseClient;

export const isSupabaseConfigured = (): boolean => {
  return !!supabaseClient;
};

export const configureSupabase = (url: string, key: string): boolean => {
  try {
    if (url && key && url.startsWith('http')) {
      supabaseClient = createClient(url, key);
      localStorage.setItem('bodega_supabase_url', url);
      localStorage.setItem('bodega_supabase_key', key);
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
};

export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem('bodega_supabase_url') || envUrl,
    key: localStorage.getItem('bodega_supabase_key') || envKey,
    isConnected: isSupabaseConfigured()
  };
};

