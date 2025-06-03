
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  name?: string;
}

export interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  name: string;
  reason?: string;
  status: 'pending' | 'approved' | 'denied';
  requested_at: string;
  processed_at?: string;
  processed_by_name?: string;
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
