import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AuditLog } from '@/types/database';

export interface Infraction {
  id: string;
  garrison: string;
  officerId: string;
  officerName: string;
  punishmentType: string;
  evidence: string;
  date: string;
  severity: 'Leve' | 'Média' | 'Grave';
  registeredBy: string;
}

export interface Statistics {
  totalInfractions: number;
  graveInfractions: number;
  uniqueOfficers: number;
}

export const useInfractionsOptimized = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query otimizada para infrações com estatísticas em paralelo
  const { data: infractionsData, isLoading, error } = useQuery({
    queryKey: ['infractions-with-stats'],
    queryFn: async () => {
      console.log('🔄 Carregando infrações e estatísticas...');
      
      // Buscar infrações com join otimizado
      const { data: infractions, error: infractionsError } = await supabase
        .from('infractions')
        .select(`
          *,
          garrisons!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (infractionsError) throw infractionsError;

      // Transformar dados para o formato esperado
      const transformedInfractions: Infraction[] = infractions.map(inf => ({
        id: inf.id,
        garrison: inf.garrisons.name,
        officerId: inf.officer_id,
        officerName: inf.officer_name,
        punishmentType: inf.punishment_type,
        evidence: inf.evidence,
        date: new Date(inf.created_at).toLocaleString('pt-BR'),
        severity: inf.severity as 'Leve' | 'Média' | 'Grave',
        registeredBy: inf.registered_by
      }));

      // Calcular estatísticas em paralelo
      const [totalInfractions, graveInfractions, uniqueOfficers] = await Promise.all([
        Promise.resolve(transformedInfractions.length),
        Promise.resolve(transformedInfractions.filter(inf => inf.severity === 'Grave').length),
        Promise.resolve(new Set(transformedInfractions.map(inf => inf.registeredBy)).size)
      ]);

      const statistics: Statistics = {
        totalInfractions,
        graveInfractions,
        uniqueOfficers
      };

      console.log('✅ Dados carregados:', { 
        infractions: transformedInfractions.length, 
        stats: statistics 
      });

      return {
        infractions: transformedInfractions,
        statistics
      };
    },
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 300000, // Manter em cache por 5 minutos
  });

  // Query para logs de auditoria
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async (): Promise<AuditLog[]> => {
      console.log('🔄 Carregando logs de auditoria...');
      
      const { data, error } = await supabase
        .rpc('get_audit_logs');

      if (error) {
        console.error('❌ Erro ao carregar logs:', error);
        throw error;
      }

      console.log('✅ Logs carregados:', data?.length || 0);
      return data || [];
    },
    staleTime: 60000, // Cache por 1 minuto
  });

  // Query para role do usuário usando função otimizada
  const { data: userRole = 'member' } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<'admin' | 'member'> => {
      if (!user?.id) return 'member';
      
      console.log('🔄 Verificando role do usuário...');
      
      const { data: role, error } = await supabase
        .rpc('get_current_user_role');

      if (error) {
        console.error('❌ Erro ao verificar role:', error);
        return 'member';
      }

      console.log('✅ Role verificada:', role);
      return (role as 'admin' | 'member') || 'member';
    },
    enabled: !!user?.id,
    staleTime: 300000, // Cache por 5 minutos
  });

  // Mutation para adicionar infração
  const addInfractionMutation = useMutation({
    mutationFn: async (infraction: Omit<Infraction, 'id' | 'date'>) => {
      console.log('➕ Adicionando infração:', infraction);

      // Buscar garrison_id
      const { data: garrison } = await supabase
        .from('garrisons')
        .select('id')
        .eq('name', infraction.garrison)
        .single();

      if (!garrison) {
        throw new Error('Guarnição não encontrada');
      }

      const { data, error } = await supabase
        .from('infractions')
        .insert([{
          officer_id: infraction.officerId,
          officer_name: infraction.officerName,
          punishment_type: infraction.punishmentType,
          evidence: infraction.evidence,
          severity: infraction.severity,
          registered_by: infraction.registeredBy,
          garrison_id: garrison.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar log de auditoria
      await supabase.rpc('create_audit_log', {
        action_type_param: 'CREATE',
        table_name_param: 'infractions',
        record_id_param: data.id,
        user_name_param: infraction.registeredBy,
        details_param: { 
          officer_name: infraction.officerName,
          severity: infraction.severity 
        }
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infractions-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast({
        title: "Sucesso",
        description: "Infração registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao adicionar infração:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar infração.",
        variant: "destructive"
      });
    }
  });

  // Mutation para deletar infração
  const deleteInfractionMutation = useMutation({
    mutationFn: async ({ infractionId, deletedBy, reason }: {
      infractionId: string;
      deletedBy: string;
      reason: string;
    }) => {
      console.log('🗑️ Deletando infração:', infractionId);

      // Buscar dados originais
      const { data: originalData } = await supabase
        .from('infractions')
        .select('*')
        .eq('id', infractionId)
        .single();

      if (!originalData) {
        throw new Error('Infração não encontrada');
      }

      // Verificar limite diário para membros
      if (userRole === 'member') {
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyCount } = await supabase
          .rpc('get_daily_deletion_count_by_role', {
            user_id_param: user!.id,
            date_param: today
          });

        if ((dailyCount || 0) >= 3) {
          throw new Error('Limite diário de 3 remoções atingido');
        }
      }

      // Criar registro de remoção
      await supabase.rpc('create_infraction_deletion', {
        infraction_id_param: infractionId,
        deleted_by_param: deletedBy,
        deletion_reason_param: reason,
        original_data_param: originalData
      });

      // Remover infração
      const { error } = await supabase
        .from('infractions')
        .delete()
        .eq('id', infractionId);

      if (error) throw error;

      // Criar log de auditoria
      await supabase.rpc('create_audit_log', {
        action_type_param: 'DELETE',
        table_name_param: 'infractions',
        record_id_param: infractionId,
        user_name_param: deletedBy,
        details_param: { 
          reason: reason,
          officer_name: originalData.officer_name 
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infractions-with-stats'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast({
        title: "Sucesso",
        description: "Infração removida com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao deletar infração:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover infração.",
        variant: "destructive"
      });
    }
  });

  return {
    infractions: infractionsData?.infractions || [],
    statistics: infractionsData?.statistics || { totalInfractions: 0, graveInfractions: 0, uniqueOfficers: 0 },
    auditLogs,
    userRole,
    isLoading,
    error,
    addInfraction: addInfractionMutation.mutate,
    deleteInfraction: deleteInfractionMutation.mutate,
    isCreating: addInfractionMutation.isPending,
    isDeleting: deleteInfractionMutation.isPending,
  };
};
