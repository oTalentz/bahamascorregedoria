
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AccessRequest } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

export const useAccessRequests = () => {
  const queryClient = useQueryClient();

  // Query to fetch access requests using the fixed RPC function
  const { data: accessRequests = [], isLoading } = useQuery({
    queryKey: ['accessRequests'],
    queryFn: async (): Promise<AccessRequest[]> => {
      try {
        const { data, error } = await supabase.rpc('get_access_requests');

        if (error) {
          console.error('Erro ao buscar solicitações:', error);
          // If error is about permissions, return empty array (user is not admin)
          if (error.message?.includes('administradores')) {
            return [];
          }
          throw error;
        }

        // Type cast to ensure status is correct type
        return (data || []).map((item: any): AccessRequest => ({
          ...item,
          status: item.status as 'pending' | 'approved' | 'denied'
        }));
      } catch (error) {
        console.error('Erro na query de access requests:', error);
        return [];
      }
    }
  });

  // Mutation to process access request (approve/deny)
  const processRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, adminName }: { 
      requestId: string; 
      action: 'approved' | 'denied';
      adminName: string;
    }) => {
      const { error } = await supabase.rpc('process_access_request', {
        request_id_param: requestId,
        action_param: action,
        processed_by_name_param: adminName
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      toast({
        title: variables.action === 'approved' ? "Solicitação aprovada" : "Solicitação negada",
        description: variables.action === 'approved' 
          ? "O usuário agora tem acesso ao sistema."
          : "A solicitação foi negada.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao processar solicitação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar solicitação.",
        variant: "destructive"
      });
    }
  });

  // Mutation to create access request
  const createAccessRequestMutation = useMutation({
    mutationFn: async ({ userId, email, name, reason }: {
      userId: string;
      email: string;
      name: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('access_requests')
        .insert([{
          user_id: userId,
          email,
          name,
          reason: reason || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de acesso foi enviada para aprovação.",
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
    accessRequests,
    isLoading,
    processRequest: processRequestMutation.mutate,
    createAccessRequest: createAccessRequestMutation.mutate,
    isProcessing: processRequestMutation.isPending || createAccessRequestMutation.isPending
  };
};
