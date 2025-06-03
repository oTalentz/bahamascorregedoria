
import { supabase } from '@/integrations/supabase/client';
import { DatabaseInfraction, CreateInfractionData, Garrison, InfractionDeletion, AuditLog } from '@/types/database';

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

    // Criar log de auditoria
    await this.createAuditLog('CREATE', 'infractions', data.id, infractionData.registered_by, {
      garrison: data.garrisons?.name,
      officer_id: data.officer_id,
      officer_name: data.officer_name,
      punishment_type: data.punishment_type,
      severity: data.severity
    });

    return data;
  }

  // Remover infração (soft delete com log)
  static async deleteInfraction(infractionId: string, deletedBy: string, reason: string): Promise<void> {
    // Primeiro, buscar os dados originais
    const { data: originalData, error: fetchError } = await supabase
      .from('infractions')
      .select(`
        *,
        garrisons (
          id,
          name,
          description
        )
      `)
      .eq('id', infractionId)
      .single();

    if (fetchError || !originalData) {
      throw new Error('Infração não encontrada');
    }

    // Verificar limite diário usando função SQL
    const today = new Date().toISOString().split('T')[0];
    const { data: countResult, error: countError } = await supabase
      .rpc('get_daily_deletion_count', { 
        deleted_by_param: deletedBy, 
        date_param: today 
      });

    if (countError) {
      console.error('Erro ao verificar limite diário:', countError);
    }

    const count = countResult || 0;
    if (count >= 3) {
      throw new Error('Limite diário de 3 remoções atingido');
    }

    // Criar registro de remoção usando função SQL
    const { error: deletionError } = await supabase
      .rpc('create_infraction_deletion', {
        infraction_id_param: infractionId,
        deleted_by_param: deletedBy,
        deletion_reason_param: reason,
        original_data_param: originalData
      });

    if (deletionError) {
      console.error('Erro ao criar registro de remoção:', deletionError);
      throw deletionError;
    }

    // Remover a infração
    const { error: removeError } = await supabase
      .from('infractions')
      .delete()
      .eq('id', infractionId);

    if (removeError) {
      console.error('Erro ao remover infração:', removeError);
      throw removeError;
    }

    // Criar log de auditoria
    await this.createAuditLog('DELETE', 'infractions', infractionId, deletedBy, {
      garrison: originalData.garrisons?.name,
      officer_id: originalData.officer_id,
      officer_name: originalData.officer_name,
      reason: reason
    });

    console.log('Infração removida com sucesso:', infractionId);
  }

  // Verificar quantas remoções foram feitas hoje por um usuário
  static async getDailyDeletionCount(deletedBy: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { data: count, error } = await supabase
      .rpc('get_daily_deletion_count', { 
        deleted_by_param: deletedBy, 
        date_param: today 
      });

    if (error) {
      console.error('Erro ao buscar contagem de remoções:', error);
      return 0;
    }

    return count || 0;
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

  // Buscar logs de auditoria usando função SQL
  static async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase.rpc('get_audit_logs');

      if (error) {
        console.error('Erro ao buscar logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro na função getAuditLogs:', error);
      return [];
    }
  }

  // Criar log de auditoria usando função SQL
  static async createAuditLog(actionType: 'CREATE' | 'DELETE', tableName: string, recordId: string, userName: string, details: any): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_audit_log', {
        action_type_param: actionType,
        table_name_param: tableName,
        record_id_param: recordId,
        user_name_param: userName,
        details_param: details
      });

      if (error) {
        console.error('Erro ao criar log de auditoria:', error);
      }
    } catch (error) {
      console.error('Erro na função createAuditLog:', error);
    }
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
