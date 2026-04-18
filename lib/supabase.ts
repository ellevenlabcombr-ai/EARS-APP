import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') => {
  if (typeof window !== 'undefined' && (window as any).__ENV && (window as any).__ENV[key]) {
    return (window as any).__ENV[key];
  }
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return '';
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL').trim();
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY').trim();

const isValidUrl = (url: string) => {
  if (!url || url.includes('TODO_')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const hasSupabaseConfig = !!supabaseUrl && 
  !!supabaseAnonKey && 
  isValidUrl(supabaseUrl) && 
  !supabaseUrl.includes('TODO_') && 
  !supabaseAnonKey.includes('TODO_');

export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: { 'x-application-name': 'ears-performance-app' },
      },
    }) 
  : null;

// Function to test connection and provide specific feedback
export const testSupabaseConnection = async () => {
  if (!supabase) {
    let reason = "Configuração ausente";
    if (supabaseUrl.includes('TODO_') || supabaseAnonKey.includes('TODO_')) {
      reason = "Variáveis de ambiente ainda são placeholders (TODO_)";
    } else if (!isValidUrl(supabaseUrl)) {
      reason = "URL do Supabase inválida";
    } else if (!supabaseUrl || !supabaseAnonKey) {
      reason = "URL ou Chave Anon estão ausentes";
    }
    
    return { 
      success: false, 
      message: `Supabase não inicializado: ${reason}`,
      details: 'Verifique as configurações no menu Settings do AI Studio.'
    };
  }

  try {
    // Try a simple query to a common table
    const { error } = await supabase.from('athletes').select('id').limit(1);
    
    if (error) {
      console.error("Supabase Connection Test Error:", error);
      
      if (error.message === 'TypeError: Load failed' || error.message === 'Failed to fetch' || error.code === 'PGRST301') {
        return {
          success: false,
          message: 'Falha na conexão de rede com o Supabase.',
          details: 'O navegador não conseguiu carregar a URL do Supabase. Verifique se o projeto não está pausado ou se há bloqueios de rede.'
        };
      }

      if (error.message?.includes('relation "athletes" does not exist')) {
        return {
          success: true,
          message: 'Conexão OK, mas tabelas não encontradas.',
          details: 'A conexão funciona, mas a tabela "athletes" não existe. Vá em Configurações > Desenvolvimento e use o Database Seeder.',
          warning: true
        };
      }

      return {
        success: false,
        message: `Erro do Supabase: ${error.message}`,
        details: error.details || error.hint || 'Sem detalhes adicionais.'
      };
    }

    return { success: true, message: 'Conexão com Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    console.error("Supabase Connection Test Exception:", err);
    return {
      success: false,
      message: 'Erro inesperado ao testar conexão.',
      details: err.message || String(err)
    };
  }
};

// Export debug info to help diagnose issues in the UI
export const supabaseDebugInfo = {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isUrlValid: isValidUrl(supabaseUrl),
  isPlaceholder: supabaseUrl.includes('TODO_') || supabaseAnonKey.includes('TODO_'),
  urlStart: supabaseUrl ? supabaseUrl.substring(0, 15) : 'none',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  isKeyJWT: supabaseAnonKey ? supabaseAnonKey.split('.').length === 3 : false
};
