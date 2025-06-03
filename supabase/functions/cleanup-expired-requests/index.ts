
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Executando limpeza de solicitações expiradas...');

    // Executar função de limpeza
    const { data, error } = await supabaseClient.rpc('cleanup_expired_deletion_requests');

    if (error) {
      console.error('Erro na limpeza:', error);
      throw error;
    }

    const cleanedCount = data?.[0]?.cleaned_requests || 0;
    console.log(`Limpeza concluída. ${cleanedCount} solicitações removidas.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Limpeza concluída com sucesso. ${cleanedCount} solicitações expiradas removidas.`,
        cleanedCount 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na função de limpeza:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
