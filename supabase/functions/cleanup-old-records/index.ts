
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CleanupResult {
  deleted_infractions: number;
  deleted_audit_logs: number;
  cleanup_timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Iniciando limpeza automática de registros antigos (24h)...');

    // Execute the cleanup function
    const { data, error } = await supabase.rpc('cleanup_old_deletion_records');

    if (error) {
      console.error('Erro ao executar limpeza:', error);
      throw error;
    }

    const result = data[0] as CleanupResult;
    
    console.log('Limpeza concluída (24h):', {
      infrações_excluídas: result.deleted_infractions,
      logs_excluídos: result.deleted_audit_logs,
      timestamp: result.cleanup_timestamp,
      período_retenção: '24 horas'
    });

    // Get cleanup statistics for monitoring
    const { data: stats, error: statsError } = await supabase.rpc('get_cleanup_stats');
    
    if (statsError) {
      console.warn('Erro ao obter estatísticas:', statsError);
    } else {
      console.log('Estatísticas atuais (24h):', stats[0]);
    }

    const response = {
      success: true,
      message: 'Limpeza automática executada com sucesso (24 horas)',
      deleted_infractions: result.deleted_infractions,
      deleted_audit_logs: result.deleted_audit_logs,
      cleanup_timestamp: result.cleanup_timestamp,
      retention_period: '24 hours',
      statistics: stats?.[0] || null
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na função de limpeza:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
