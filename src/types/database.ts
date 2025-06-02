
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
  severity: 'Leve' | 'Média' | 'Grave';
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
  severity: 'Leve' | 'Média' | 'Grave';
  registered_by: string;
}
