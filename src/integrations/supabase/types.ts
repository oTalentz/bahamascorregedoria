export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          processed_at: string | null
          processed_by: string | null
          processed_by_name: string | null
          reason: string | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          processed_at?: string | null
          processed_by?: string | null
          processed_by_name?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          processed_at?: string | null
          processed_by?: string | null
          processed_by_name?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json | null
          id: string
          record_id: string
          table_name: string
          user_name: string
        }
        Insert: {
          action_type: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id: string
          table_name: string
          user_name: string
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string
          table_name?: string
          user_name?: string
        }
        Relationships: []
      }
      deletion_requests: {
        Row: {
          created_at: string | null
          deletion_reason: string
          expires_at: string | null
          id: string
          infraction_id: string
          original_data: Json
          processed_at: string | null
          processed_by_name: string | null
          processed_by_user_id: string | null
          requested_by_name: string
          requested_by_user_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          deletion_reason: string
          expires_at?: string | null
          id?: string
          infraction_id: string
          original_data: Json
          processed_at?: string | null
          processed_by_name?: string | null
          processed_by_user_id?: string | null
          requested_by_name: string
          requested_by_user_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          deletion_reason?: string
          expires_at?: string | null
          id?: string
          infraction_id?: string
          original_data?: Json
          processed_at?: string | null
          processed_by_name?: string | null
          processed_by_user_id?: string | null
          requested_by_name?: string
          requested_by_user_id?: string
          status?: string
        }
        Relationships: []
      }
      garrisons: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      infraction_deletions: {
        Row: {
          deleted_at: string
          deleted_by: string
          deletion_reason: string
          id: string
          infraction_id: string
          original_data: Json
        }
        Insert: {
          deleted_at?: string
          deleted_by: string
          deletion_reason: string
          id?: string
          infraction_id: string
          original_data: Json
        }
        Update: {
          deleted_at?: string
          deleted_by?: string
          deletion_reason?: string
          id?: string
          infraction_id?: string
          original_data?: Json
        }
        Relationships: []
      }
      infractions: {
        Row: {
          created_at: string | null
          evidence: string
          garrison_id: number
          id: string
          officer_id: string
          officer_name: string
          punishment_type: string
          registered_by: string
          severity: string
        }
        Insert: {
          created_at?: string | null
          evidence: string
          garrison_id: number
          id?: string
          officer_id: string
          officer_name: string
          punishment_type: string
          registered_by: string
          severity: string
        }
        Update: {
          created_at?: string | null
          evidence?: string
          garrison_id?: number
          id?: string
          officer_id?: string
          officer_name?: string
          punishment_type?: string
          registered_by?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "infractions_garrison_id_fkey"
            columns: ["garrison_id"]
            isOneToOne: false
            referencedRelation: "garrisons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_deletion_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_requests: number
        }[]
      }
      cleanup_old_deletion_records: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_infractions: number
          deleted_audit_logs: number
          cleanup_timestamp: string
        }[]
      }
      create_audit_log: {
        Args: {
          action_type_param: string
          table_name_param: string
          record_id_param: string
          user_name_param: string
          details_param: Json
        }
        Returns: undefined
      }
      create_infraction_deletion: {
        Args: {
          infraction_id_param: string
          deleted_by_param: string
          deletion_reason_param: string
          original_data_param: Json
        }
        Returns: undefined
      }
      get_access_requests: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          email: string
          name: string
          reason: string
          status: string
          requested_at: string
          processed_at: string
          processed_by_name: string
          created_at: string
        }[]
      }
      get_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          action_type: string
          table_name: string
          record_id: string
          user_name: string
          details: Json
          created_at: string
        }[]
      }
      get_cleanup_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_deletion_records: number
          records_pending_cleanup: number
          next_cleanup_candidates: number
          oldest_deletion_record: string
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_daily_deletion_count: {
        Args: { deleted_by_param: string; date_param: string }
        Returns: number
      }
      get_daily_deletion_count_by_role: {
        Args: { user_id_param: string; date_param: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_access_request: {
        Args: {
          request_id_param: string
          action_param: string
          processed_by_name_param: string
        }
        Returns: undefined
      }
      process_approved_deletion_request: {
        Args: { request_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
