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
  severity: string; // Aceita qualquer string do banco
  registered_by: string;
  created_at: string;
  punishment?: string; // Campo adicional para punição aplicada
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
  punishment?: string; // Campo opcional para punição aplicada
}

export interface InfractionDeletion {
  id: string;
  infraction_id: string;
  deleted_by: string;
  deletion_reason: string;
  original_data: any;
  deleted_at: string;
}

export interface AuditLog {
  id: string;
  action_type: 'CREATE' | 'DELETE' | 'CLEANUP';
  table_name: string;
  record_id: string;
  user_name: string;
  details: any;
  created_at: string;
}

export interface DeletionRequest {
  id: string;
  infraction_id: string;
  requested_by_user_id: string;
  requested_by_name: string;
  deletion_reason: string;
  original_data: any;
  status: 'pending' | 'approved' | 'denied' | 'processed';
  processed_by_user_id?: string;
  processed_by_name?: string;
  processed_at?: string;
  created_at: string;
  expires_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  created_by?: string;
}
