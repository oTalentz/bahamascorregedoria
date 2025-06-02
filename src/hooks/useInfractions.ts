
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '@/services/supabaseService';
import { DatabaseInfraction, CreateInfractionData, Garrison } from '@/types/database';
import { Infraction } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

export const useInfractions = () => {
  const queryClient = useQueryClient();
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const [localInfractions, setLocalInfractions] = useState<Infraction[]>([]);

  // Verificar se Supabase está configurado
  const isSupabaseConfigured = SupabaseService.isConfigured();

  // Query para buscar infrações (apenas se Supabase estiver configurado)
  const {
    data: databaseInfractions = [],
    isLoading: isLoadingDatabase,
    error
  } = useQuery({
    queryKey: ['infractions'],
    queryFn: SupabaseService.getInfractions,
    enabled: isSupabaseConfigured,
  });

  // Query para buscar guarnições (apenas se Supabase estiver configurado)
  const { data: garrisons = [] } = useQuery({
    queryKey: ['garrisons'],
    queryFn: SupabaseService.getGarrisons,
    enabled: isSupabaseConfigured,
  });

  // Carregar dados do localStorage se Supabase não estiver configurado
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUseLocalStorage(true);
      const localData = localStorage.getItem('policeInfractions');
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          setLocalInfractions(parsedData);
        } catch (error) {
          console.error('Erro ao carregar dados do localStorage:', error);
          setLocalInfractions([]);
        }
      }
    }
  }, [isSupabaseConfigured]);

  // Converter infrações do banco para formato do frontend
  const infractions: Infraction[] = useLocalStorage 
    ? localInfractions
    : databaseInfractions.map(dbInfraction => ({
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

  // Mutation para criar infração no Supabase
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

  // Função para adicionar infração no localStorage
  const addToLocalStorage = (infraction: Omit<Infraction, 'id' | 'date'>) => {
    const newInfraction: Infraction = {
      ...infraction,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR')
    };

    const updatedInfractions = [...localInfractions, newInfraction];
    setLocalInfractions(updatedInfractions);
    localStorage.setItem('policeInfractions', JSON.stringify(updatedInfractions));

    toast({
      title: "Infração registrada",
      description: "Infração foi salva localmente. Configure o Supabase para persistência em banco de dados.",
    });
  };

  // Função principal para adicionar infração
  const addInfraction = (infraction: Omit<Infraction, 'id' | 'date'>) => {
    if (isSupabaseConfigured) {
      createInfractionMutation.mutate(infraction);
    } else {
      addToLocalStorage(infraction);
    }
  };

  // Inicializar guarnições e migrar dados do localStorage (apenas se Supabase estiver configurado)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

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
  }, [queryClient, isSupabaseConfigured]);

  return {
    infractions,
    isLoading: isSupabaseConfigured ? isLoadingDatabase : false,
    error: isSupabaseConfigured ? error : null,
    addInfraction,
    isCreating: isSupabaseConfigured ? createInfractionMutation.isPending : false,
    isUsingLocalStorage: useLocalStorage,
    isSupabaseConfigured
  };
};
