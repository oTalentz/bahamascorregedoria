
export interface Garrison {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface DatabaseInfraction {
  id: string;
  garrison_id: number;
  officer_id: string;
  officer_name: string;
  punishment_type: string;
  evidence: string;
  severity: string; // Mudança: aceita qualquer string do banco
  registered_by: string;
  created_at: string;
  // Relação com garrison
  garrisons?: Garrison;
}

export interface CreateInfractionData {
  garrison_id: number;
  officer_id: string;
  officer_name: string;
  punishment_type: string;
  evidence: string;
  severity: 'Leve' | 'Média' | 'Grave'; // Mantém tipagem restrita para criação
  registered_by: string;
}
