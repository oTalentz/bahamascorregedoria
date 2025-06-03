
import { supabase } from '@/integrations/supabase/client';
import { DatabaseInfraction, CreateInfractionData, Garrison } from '@/types/database';

// Função helper para validar severidade
const validateSeverity = (severity: string): 'Leve' | 'Média' | 'Grave' => {
  const validSeverities = ['Leve', 'Média', 'Grave'];
  if (validSeverities.includes(severity)) {
    return severity as 'Leve' | 'Média' | 'Grave';
  }
  console.warn(`Severidade inválida encontrada: ${severity}. Usando 'Leve' como padrão.`);
  return 'Leve';
};

export class SupabaseService {
  // Buscar todas as infrações com dados da guarnição
  static async getInfractions(): Promise<DatabaseInfraction[]> {
    const { data, error } = await supabase
      .from('infractions')
      .select(`
        *,
        garrisons (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar infrações:', error);
      throw error;
    }

    return data || [];
  }

  // Criar nova infração
  static async createInfraction(infractionData: CreateInfractionData): Promise<DatabaseInfraction> {
    const { data, error } = await supabase
      .from('infractions')
      .insert([infractionData])
      .select(`
        *,
        garrisons (
          id,
          name,
          description
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao criar infração:', error);
      throw error;
    }

    return data;
  }

  // Buscar todas as guarnições
  static async getGarrisons(): Promise<Garrison[]> {
    const { data, error } = await supabase
      .from('garrisons')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar guarnições:', error);
      throw error;
    }

    return data || [];
  }

  // Migrar dados do localStorage para Supabase (caso existam)
  static async migrateLocalStorageData(): Promise<void> {
    const localData = localStorage.getItem('policeInfractions');
    if (!localData) return;

    try {
      const infractions = JSON.parse(localData);
      const garrisons = await this.getGarrisons();
      
      for (const infraction of infractions) {
        const garrison = garrisons.find(g => g.name === infraction.garrison);
        if (garrison) {
          const infractionData: CreateInfractionData = {
            garrison_id: garrison.id,
            officer_id: infraction.officerId,
            officer_name: infraction.officerName,
            punishment_type: infraction.punishmentType,
            evidence: infraction.evidence,
            severity: validateSeverity(infraction.severity),
            registered_by: infraction.registeredBy
          };

          try {
            await this.createInfraction(infractionData);
          } catch (error) {
            console.error('Erro ao migrar infração:', error);
          }
        }
      }

      // Limpar localStorage após migração bem-sucedida
      localStorage.removeItem('policeInfractions');
      console.log('Migração do localStorage concluída com sucesso');
    } catch (error) {
      console.error('Erro na migração:', error);
    }
  }

  // Buscar estatísticas
  static async getStatistics() {
    try {
      // Total de infrações
      const { count: totalInfractions } = await supabase
        .from('infractions')
        .select('*', { count: 'exact', head: true });

      // Infrações graves
      const { count: graveInfractions } = await supabase
        .from('infractions')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'Grave');

      // Policiais aplicadores únicos
      const { data: uniqueOfficers } = await supabase
        .from('infractions')
        .select('registered_by')
        .order('registered_by');

      const uniqueOfficersCount = new Set(uniqueOfficers?.map(o => o.registered_by)).size;

      return {
        totalInfractions: totalInfractions || 0,
        graveInfractions: graveInfractions || 0,
        uniqueOfficers: uniqueOfficersCount
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        totalInfractions: 0,
        graveInfractions: 0,
        uniqueOfficers: 0
      };
    }
  }
}
