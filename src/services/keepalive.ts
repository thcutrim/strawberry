import { supabase } from './supabase';

export interface KeepAliveResponse {
  success: boolean;
  timestamp: string;
  source: 'direct_supabase' | 'bridge_worker';
  details?: string;
  error?: string;
}

const API_WORKER_URL = 'https://strawberry-bridge.edigicert-app.workers.dev';

/**
 * Executa o ping de keep-alive no Supabase para impedir a suspensão automática
 * por inatividade (regra do free tier de 7 dias do Supabase).
 *
 * Estratégia idêntica à do ecossistema eDigiCert:
 * 1. Ping direto via client Supabase JS consultando tabela ativa.
 * 2. Ping complementar via Cloudflare Worker (/api/keepalive).
 */
export async function keepAliveSupabase(): Promise<KeepAliveResponse> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Ping direto no Supabase
    const { data, error } = await supabase
      .from('checkout_upload_logs')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('[Keep-Alive Supabase Warning]', error.message);
      
      // Fallback: ping via worker bridge
      try {
        const workerRes = await fetch(`${API_WORKER_URL}/api/keepalive`);
        if (workerRes.ok) {
          console.log('[Keep-Alive Supabase OK via Worker Bridge]', timestamp);
          return {
            success: true,
            timestamp,
            source: 'bridge_worker',
            details: 'Ping realizado com sucesso através do Cloudflare Worker Bridge'
          };
        }
      } catch (workerErr: any) {
        console.error('[Keep-Alive Worker Bridge Error]', workerErr);
      }

      return {
        success: false,
        timestamp,
        source: 'direct_supabase',
        error: error.message
      };
    }

    console.log('[Keep-Alive Supabase OK] Ping realizado com sucesso no banco de dados Supabase.', {
      timestamp,
      rowsFound: data?.length || 0
    });

    // 2. Notifica o worker em segundo plano sem bloquear
    fetch(`${API_WORKER_URL}/api/keepalive`).catch(() => {});

    return {
      success: true,
      timestamp,
      source: 'direct_supabase',
      details: `Banco ativo e conectado (${data?.length || 0} registros consultados)`
    };
  } catch (err: any) {
    console.error('[Keep-Alive Supabase Exception]', err);
    return {
      success: false,
      timestamp,
      source: 'direct_supabase',
      error: err instanceof Error ? err.message : 'Falha ao executar ping no Supabase'
    };
  }
}
