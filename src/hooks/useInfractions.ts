
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/services/supabaseService';
import { DatabaseInfraction, CreateInfractionData, Garrison } from '@/types/database';
import { Infraction } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Função helper para validar severidade
const validateSeverity = (severity: string): 'Leve' | 'Média' | 'Grave' => {
  const validSeverities = ['Leve', 'Média', 'Grave'];
  if (validSeverities.includes(severity)) {
    return severity as 'Leve' | 'Média' | 'Grave';
  }
  console.warn(`Severidade inválida encontrada: ${severity}. Usando 'Leve' como padrão.`);
  return 'Leve';
};

export const useInfractions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query para buscar infrações
  const {
    data: databaseInfractions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['infractions'],
    queryFn: SupabaseService.getInfractions,
  });

  // Query para buscar guarnições
  const { data: garrisons = [] } = useQuery({
    queryKey: ['garrisons'],
    queryFn: SupabaseService.getGarrisons,
  });

  // Query para buscar estatísticas
  const { data: statistics } = useQuery({
    queryKey: ['statistics'],
    queryFn: SupabaseService.getStatistics,
  });

  // Query para buscar logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: SupabaseService.getAuditLogs,
  });

  // Query para buscar estatísticas de limpeza
  const { data: cleanupStats } = useQuery({
    queryKey: ['cleanup-stats'],
    queryFn: SupabaseService.getCleanupStats,
    refetchInterval: 60000, // Atualiza a cada minuto
  });

  // Converter infrações do banco para formato do frontend
  const infractions: Infraction[] = databaseInfractions.map(dbInfraction => ({
    id: dbInfraction.id,
    garrison: dbInfraction.garrisons?.name || '',
    officerId: dbInfraction.officer_id,
    officerName: dbInfraction.officer_name,
    punishmentType: dbInfraction.punishment_type,
    evidence: dbInfraction.evidence,
    date: new Date(dbInfraction.created_at).toLocaleDateString('pt-BR'),
    severity: validateSeverity(dbInfraction.severity),
    registeredBy: dbInfraction.registered_by
  }));

  // Mutation para criar infração
  const createInfractionMutation = useMutation({
    mutationFn: async (infraction: Omit<Infraction, 'id' | 'date'>) => {
      const garrison = garrisons.find(g => g.name === infraction.garrison);
      if (!garrison) {
        throw new Error('Guarnição não encontrada');
      }

      const infractionData: CreateInfractionData = {
        garrison_id: garrison.id,
        officer_id: infraction.officerId,
        officer_name: infraction.officerName,
        punishment_type: infraction.punishmentType,
        evidence: infraction.evidence,
        severity: infraction.severity,
        registered_by: infraction.registeredBy
      };

      return SupabaseService.createInfraction(infractionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infractions'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      toast({
        title: "Infração registrada",
        description: "Infração foi registrada com sucesso no banco de dados.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar infração:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar infração. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation atualizada para considerar roles
  const deleteInfractionMutation = useMutation({
    mutationFn: async ({ infractionId, deletedBy, reason }: { infractionId: string, deletedBy: string, reason: string }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Para admins - remoção direta
      if (user.role === 'admin') {
        return SupabaseService.deleteInfraction(infractionId, deletedBy, reason);
      }

      // Para membros - verificar limite e criar solicitação
      const dailyCount = await SupabaseService.getDailyDeletionCountByRole(user.id);
      if (dailyCount >= 5) {
        throw new Error('Limite diário de 5 remoções atingido');
      }

      // Buscar dados da infração para a solicitação
      const infractions = await SupabaseService.getInfractions();
      const infraction = infractions.find(i => i.id === infractionId);
      
      if (!infraction) throw new Error('Infração não encontrada');

      // Criar solicitação de remoção
      await SupabaseService.createDeletionRequest(
        infractionId,
        user.id,
        user.name || user.email,
        reason,
        infraction
      );
    },
    onSuccess: (_, { deletedBy }) => {
      queryClient.invalidateQueries({ queryKey: ['infractions'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
      
      if (user?.role === 'admin') {
        toast({
          title: "Infração removida",
          description: "Infração foi removida com sucesso.",
        });
      } else {
        toast({
          title: "Solicitação enviada",
          description: "Sua solicitação de remoção foi enviada para aprovação de um administrador.",
        });
      }
    },
    onError: (error: any) => {
      console.error('Erro ao processar remoção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar remoção. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation para executar limpeza manual
  const executeCleanupMutation = useMutation({
    mutationFn: SupabaseService.executeCleanup,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cleanup-stats'] });
        queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
        toast({
          title: "Limpeza executada",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro na limpeza",
          description: result.message,
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Erro ao executar limpeza:', error);
      toast({
        title: "Erro",
        description: "Erro ao executar limpeza. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Função principal para adicionar infração
  const addInfraction = (infraction: Omit<Infraction, 'id' | 'date'>) => {
    createInfractionMutation.mutate(infraction);
  };

  // Função para remover infração
  const deleteInfraction = (infractionId: string, deletedBy: string, reason: string) => {
    deleteInfractionMutation.mutate({ infractionId, deletedBy, reason });
  };

  // Migrar dados do localStorage na primeira execução
  useEffect(() => {
    const migrateData = async () => {
      try {
        await SupabaseService.migrateLocalStorageData();
        queryClient.invalidateQueries({ queryKey: ['infractions'] });
        queryClient.invalidateQueries({ queryKey: ['statistics'] });
      } catch (error) {
        console.error('Erro na migração:', error);
      }
    };

    migrateData();
  }, [queryClient]);

  return {
    infractions,
    isLoading,
    error,
    addInfraction,
    deleteInfraction,
    isCreating: createInfractionMutation.isPending,
    isDeleting: deleteInfractionMutation.isPending,
    isUsingLocalStorage: false,
    isSupabaseConfigured: true,
    statistics: statistics || { totalInfractions: 0, graveInfractions: 0, uniqueOfficers: 0 },
    garrisons,
    auditLogs,
    cleanupStats,
    executeCleanup: () => executeCleanupMutation.mutate(),
    isExecutingCleanup: executeCleanupMutation.isPending,
    userRole: user?.role
  };
};
