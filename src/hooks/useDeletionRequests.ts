
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeletionRequest } from '@/types/auth';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useDeletionRequests = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query para buscar solicitações de remoção
  const { data: deletionRequests = [], isLoading } = useQuery({
    queryKey: ['deletion-requests'],
    queryFn: async (): Promise<DeletionRequest[]> => {
      const { data, error } = await supabase
        .from('deletion_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar solicitações:', error);
        throw error;
      }

      // Converter os dados do Supabase para o formato tipado correto
      return (data || []).map(item => ({
        id: item.id,
        infraction_id: item.infraction_id,
        requested_by_user_id: item.requested_by_user_id,
        requested_by_name: item.requested_by_name,
        deletion_reason: item.deletion_reason,
        original_data: item.original_data,
        status: item.status as 'pending' | 'approved' | 'denied' | 'processed',
        processed_by_user_id: item.processed_by_user_id,
        processed_by_name: item.processed_by_name,
        processed_at: item.processed_at,
        created_at: item.created_at,
        expires_at: item.expires_at
      }));
    },
    enabled: !!user
  });

  // Mutation para aprovar solicitação
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Atualizar status para aprovado
      const { error: updateError } = await supabase
        .from('deletion_requests')
        .update({
          status: 'approved',
          processed_by_user_id: user?.id,
          processed_by_name: user?.name || user?.email,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Processar a aprovação (remover infração)
      const { error: processError } = await supabase
        .rpc('process_approved_deletion_request', {
          request_id_param: requestId
        });

      if (processError) throw processError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['infractions'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast({
        title: "Solicitação aprovada",
        description: "A infração foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao aprovar solicitação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao aprovar solicitação.",
        variant: "destructive"
      });
    }
  });

  // Mutation para negar solicitação
  const denyMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('deletion_requests')
        .update({
          status: 'denied',
          processed_by_user_id: user?.id,
          processed_by_name: user?.name || user?.email,
          processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
      toast({
        title: "Solicitação negada",
        description: "A solicitação foi negada e arquivada.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao negar solicitação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao negar solicitação.",
        variant: "destructive"
      });
    }
  });

  // Mutation para criar solicitação de remoção
  const createDeletionRequestMutation = useMutation({
    mutationFn: async ({ 
      infractionId, 
      reason, 
      originalData 
    }: { 
      infractionId: string; 
      reason: string; 
      originalData: any; 
    }) => {
      const { error } = await supabase
        .from('deletion_requests')
        .insert([{
          infraction_id: infractionId,
          requested_by_user_id: user?.id,
          requested_by_name: user?.name || user?.email,
          deletion_reason: reason,
          original_data: originalData
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de remoção foi enviada para aprovação.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar solicitação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar solicitação.",
        variant: "destructive"
      });
    }
  });

  return {
    deletionRequests,
    isLoading,
    approveDeletionRequest: approveMutation.mutate,
    denyDeletionRequest: denyMutation.mutate,
    createDeletionRequest: createDeletionRequestMutation.mutate,
    isProcessing: approveMutation.isPending || denyMutation.isPending || createDeletionRequestMutation.isPending
  };
};
