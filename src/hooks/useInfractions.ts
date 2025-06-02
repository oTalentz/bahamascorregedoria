
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/services/supabaseService';
import { DatabaseInfraction, CreateInfractionData, Garrison } from '@/types/database';
import { Infraction } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

export const useInfractions = () => {
  const queryClient = useQueryClient();

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

  // Converter infrações do banco para formato do frontend
  const infractions: Infraction[] = databaseInfractions.map(dbInfraction => ({
    id: dbInfraction.id,
    garrison: dbInfraction.garrisons?.name || '',
    officerId: dbInfraction.officer_id,
    officerName: dbInfraction.officer_name,
    punishmentType: dbInfraction.punishment_type,
    evidence: dbInfraction.evidence,
    date: new Date(dbInfraction.created_at).toLocaleDateString('pt-BR'),
    severity: dbInfraction.severity,
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

  // Inicializar guarnições e migrar dados do localStorage
  useEffect(() => {
    const initializeData = async () => {
      try {
        await SupabaseService.initializeGarrisons();
        await SupabaseService.migrateLocalStorageData();
        queryClient.invalidateQueries({ queryKey: ['garrisons'] });
        queryClient.invalidateQueries({ queryKey: ['infractions'] });
      } catch (error) {
        console.error('Erro na inicialização:', error);
      }
    };

    initializeData();
  }, [queryClient]);

  return {
    infractions,
    isLoading,
    error,
    addInfraction: createInfractionMutation.mutate,
    isCreating: createInfractionMutation.isPending
  };
};
