
import { createClient } from '@supabase/supabase-js';
import { DatabaseInfraction, CreateInfractionData, Garrison } from '@/types/database';

// Configuração do Supabase com fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificar se as variáveis estão configuradas
const isSupabaseConfigured = supabaseUrl && supabaseKey;

// Criar cliente apenas se configurado
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export class SupabaseService {
  // Verificar se Supabase está configurado
  private static checkConfiguration() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase não configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
    }
  }

  // Buscar todas as infrações com dados da guarnição
  static async getInfractions(): Promise<DatabaseInfraction[]> {
    this.checkConfiguration();
    
    const { data, error } = await supabase!
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
    this.checkConfiguration();
    
    const { data, error } = await supabase!
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
    this.checkConfiguration();
    
    const { data, error } = await supabase!
      .from('garrisons')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar guarnições:', error);
      throw error;
    }

    return data || [];
  }

  // Criar guarnições iniciais se não existirem
  static async initializeGarrisons(): Promise<void> {
    this.checkConfiguration();
    
    const garrisons = ['CORE', 'BOPE', 'COE', 'GATE', 'PRF', 'CIVIL', 'ROTAM', 'CHOQUE'];
    
    for (const garrison of garrisons) {
      const { error } = await supabase!
        .from('garrisons')
        .upsert({ name: garrison }, { onConflict: 'name' });
      
      if (error) {
        console.error(`Erro ao criar guarnição ${garrison}:`, error);
      }
    }
  }

  // Migrar dados do localStorage para Supabase
  static async migrateLocalStorageData(): Promise<void> {
    this.checkConfiguration();
    
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
            severity: infraction.severity,
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

  // Verificar se está configurado (método público)
  static isConfigured(): boolean {
    return isSupabaseConfigured;
  }
}
