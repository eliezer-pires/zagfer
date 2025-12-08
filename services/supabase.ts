import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

// Verifica se as chaves foram configuradas
export const isSupabaseConfigured = () => {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
};

// Cria o cliente apenas se houver configuração, senão retorna null
export const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;