export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      collaborator_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      custom_tasks: {
        Row: {
          assigned_to_email: string | null
          category: string
          created_at: string | null
          deadline: string
          description: string | null
          id: string
          notes: string | null
          phase: string
          task_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to_email?: string | null
          category: string
          created_at?: string | null
          deadline: string
          description?: string | null
          id?: string
          notes?: string | null
          phase?: string
          task_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to_email?: string | null
          category?: string
          created_at?: string | null
          deadline?: string
          description?: string | null
          id?: string
          notes?: string | null
          phase?: string
          task_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moving_collaborators: {
        Row: {
          accepted_at: string | null
          collaborator_email: string
          collaborator_user_id: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          owner_user_id: string
        }
        Insert: {
          accepted_at?: string | null
          collaborator_email: string
          collaborator_user_id?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          owner_user_id: string
        }
        Update: {
          accepted_at?: string | null
          collaborator_email?: string
          collaborator_user_id?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          owner_user_id?: string
        }
        Relationships: []
      }
      moving_documents: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          upload_date: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          upload_date?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moving_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          description: string | null
          expense_date: string
          id: string
          receipt_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moving_tips: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          order_index: number | null
          phase: string
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          phase: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          phase?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adults: number | null
          birth_date: string | null
          building_access: string | null
          building_year: string | null
          children: number | null
          children_ages: string | null
          created_at: string
          current_housing_situation: string | null
          energy_connection_type: string | null
          energy_current_supplier: string | null
          floor_level: string | null
          forwarding_duration: string | null
          forwarding_start_date: string | null
          garden_service_type: string | null
          garden_size: string | null
          glasvezel: string | null
          has_elevator: string | null
          has_fiber: string | null
          has_fragile_items: string | null
          has_garden: boolean | null
          has_gas: string | null
          has_job: boolean | null
          has_parking: boolean | null
          has_smart_meter: string | null
          home_size_m2: string | null
          household_names: string[] | null
          household_type: string | null
          housing_property_type: string | null
          id: string
          insurance_value: string | null
          internet_bundle: string | null
          internet_speed_preference: string | null
          is_vve: boolean | null
          key_handover_date: string | null
          moving_date: string | null
          moving_type: string | null
          municipality: string | null
          needs_contractor_help: boolean | null
          new_address: string | null
          number_of_bedrooms: string | null
          number_of_floors: string | null
          number_of_rooms: string | null
          old_address: string | null
          pet_types: string[] | null
          pets: number | null
          phone: string | null
          preferred_service_date: string | null
          renovation_budget: string | null
          renovation_start_date: string | null
          renovation_type: string | null
          service_type: string | null
          special_items: string[] | null
          updated_at: string
          user_id: string
          works_from_home: string | null
        }
        Insert: {
          adults?: number | null
          birth_date?: string | null
          building_access?: string | null
          building_year?: string | null
          children?: number | null
          children_ages?: string | null
          created_at?: string
          current_housing_situation?: string | null
          energy_connection_type?: string | null
          energy_current_supplier?: string | null
          floor_level?: string | null
          forwarding_duration?: string | null
          forwarding_start_date?: string | null
          garden_service_type?: string | null
          garden_size?: string | null
          glasvezel?: string | null
          has_elevator?: string | null
          has_fiber?: string | null
          has_fragile_items?: string | null
          has_garden?: boolean | null
          has_gas?: string | null
          has_job?: boolean | null
          has_parking?: boolean | null
          has_smart_meter?: string | null
          home_size_m2?: string | null
          household_names?: string[] | null
          household_type?: string | null
          housing_property_type?: string | null
          id?: string
          insurance_value?: string | null
          internet_bundle?: string | null
          internet_speed_preference?: string | null
          is_vve?: boolean | null
          key_handover_date?: string | null
          moving_date?: string | null
          moving_type?: string | null
          municipality?: string | null
          needs_contractor_help?: boolean | null
          new_address?: string | null
          number_of_bedrooms?: string | null
          number_of_floors?: string | null
          number_of_rooms?: string | null
          old_address?: string | null
          pet_types?: string[] | null
          pets?: number | null
          phone?: string | null
          preferred_service_date?: string | null
          renovation_budget?: string | null
          renovation_start_date?: string | null
          renovation_type?: string | null
          service_type?: string | null
          special_items?: string[] | null
          updated_at?: string
          user_id: string
          works_from_home?: string | null
        }
        Update: {
          adults?: number | null
          birth_date?: string | null
          building_access?: string | null
          building_year?: string | null
          children?: number | null
          children_ages?: string | null
          created_at?: string
          current_housing_situation?: string | null
          energy_connection_type?: string | null
          energy_current_supplier?: string | null
          floor_level?: string | null
          forwarding_duration?: string | null
          forwarding_start_date?: string | null
          garden_service_type?: string | null
          garden_size?: string | null
          glasvezel?: string | null
          has_elevator?: string | null
          has_fiber?: string | null
          has_fragile_items?: string | null
          has_garden?: boolean | null
          has_gas?: string | null
          has_job?: boolean | null
          has_parking?: boolean | null
          has_smart_meter?: string | null
          home_size_m2?: string | null
          household_names?: string[] | null
          household_type?: string | null
          housing_property_type?: string | null
          id?: string
          insurance_value?: string | null
          internet_bundle?: string | null
          internet_speed_preference?: string | null
          is_vve?: boolean | null
          key_handover_date?: string | null
          moving_date?: string | null
          moving_type?: string | null
          municipality?: string | null
          needs_contractor_help?: boolean | null
          new_address?: string | null
          number_of_bedrooms?: string | null
          number_of_floors?: string | null
          number_of_rooms?: string | null
          old_address?: string | null
          pet_types?: string[] | null
          pets?: number | null
          phone?: string | null
          preferred_service_date?: string | null
          renovation_budget?: string | null
          renovation_start_date?: string | null
          renovation_type?: string | null
          service_type?: string | null
          special_items?: string[] | null
          updated_at?: string
          user_id?: string
          works_from_home?: string | null
        }
        Relationships: []
      }
      reminder_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_reminders: {
        Row: {
          created_at: string
          id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_deadlines: {
        Row: {
          created_at: string | null
          deadline: string
          id: string
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deadline: string
          id?: string
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string
          id?: string
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_reminder_disabled: {
        Row: {
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_email: string | null
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_email?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          assigned_to_email?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_assignee_email: {
        Args: { assignee_email_fallback: string; assignee_user_id: string }
        Returns: string
      }
    }
    Enums: {
      task_status: "todo" | "in_progress" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      task_status: ["todo", "in_progress", "done"],
    },
  },
} as const
