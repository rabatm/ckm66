export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string | null
          attended: boolean
          course_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          reservation_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attendance_date?: string | null
          attended: boolean
          course_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reservation_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_date?: string | null
          attended?: boolean
          course_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reservation_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'attendance_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendance_reservation_id_fkey'
            columns: ['reservation_id']
            isOneToOne: false
            referencedRelation: 'reservations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'attendance_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      courses: {
        Row: {
          backup_instructor_id: string | null
          created_at: string | null
          created_by: string | null
          current_reservations: number
          day_of_week: number | null
          description: string | null
          duration_minutes: number | null
          end_time: string
          id: string
          instructor_id: string | null
          is_active: boolean | null
          is_recurring: boolean | null
          level: string | null
          location: string | null
          max_age: number | null
          max_capacity: number
          min_age: number | null
          prerequisites: string[] | null
          recurrence_end: string | null
          required_equipment: string[] | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          backup_instructor_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_reservations?: number
          day_of_week?: number | null
          description?: string | null
          duration_minutes?: number | null
          end_time: string
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          is_recurring?: boolean | null
          level?: string | null
          location?: string | null
          max_age?: number | null
          max_capacity?: number
          min_age?: number | null
          prerequisites?: string[] | null
          recurrence_end?: string | null
          required_equipment?: string[] | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          backup_instructor_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_reservations?: number
          day_of_week?: number | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string
          id?: string
          instructor_id?: string | null
          is_active?: boolean | null
          is_recurring?: boolean | null
          level?: string | null
          location?: string | null
          max_age?: number | null
          max_capacity?: number
          min_age?: number | null
          prerequisites?: string[] | null
          recurrence_end?: string | null
          required_equipment?: string[] | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'courses_backup_instructor_id_fkey'
            columns: ['backup_instructor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'courses_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'courses_instructor_id_fkey'
            columns: ['instructor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notification_queue: {
        Row: {
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          message_content: string | null
          reservation_id: string | null
          scheduled_for: string
          sent_at: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          reservation_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          reservation_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_queue_reservation_id_fkey'
            columns: ['reservation_id']
            isOneToOne: false
            referencedRelation: 'reservations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notification_queue_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      notification_settings: {
        Row: {
          cancellation_notifications: boolean | null
          created_at: string | null
          email_enabled: boolean | null
          id: string
          promotion_notifications: boolean | null
          push_enabled: boolean | null
          reminder_24h: boolean | null
          reminder_2h: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancellation_notifications?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          promotion_notifications?: boolean | null
          push_enabled?: boolean | null
          reminder_24h?: boolean | null
          reminder_2h?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancellation_notifications?: boolean | null
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          promotion_notifications?: boolean | null
          push_enabled?: boolean | null
          reminder_24h?: boolean | null
          reminder_2h?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          attended: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in_time: string | null
          check_out_time: string | null
          course_id: string | null
          created_at: string | null
          id: string
          last_notification_date: string | null
          notes: string | null
          notification_sent: boolean | null
          promoted_at: string | null
          promoted_from_waiting_at: string | null
          promotion_reason: string | null
          refund_amount: number | null
          reservation_date: string | null
          reserved_at: string | null
          session_deducted: boolean | null
          sessions_deducted: number | null
          status: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
          waiting_list_position: number | null
        }
        Insert: {
          attended?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          last_notification_date?: string | null
          notes?: string | null
          notification_sent?: boolean | null
          promoted_at?: string | null
          promoted_from_waiting_at?: string | null
          promotion_reason?: string | null
          refund_amount?: number | null
          reservation_date?: string | null
          reserved_at?: string | null
          session_deducted?: boolean | null
          sessions_deducted?: number | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          waiting_list_position?: number | null
        }
        Update: {
          attended?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          last_notification_date?: string | null
          notes?: string | null
          notification_sent?: boolean | null
          promoted_at?: string | null
          promoted_from_waiting_at?: string | null
          promotion_reason?: string | null
          refund_amount?: number | null
          reservation_date?: string | null
          reserved_at?: string | null
          session_deducted?: boolean | null
          sessions_deducted?: number | null
          status?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          waiting_list_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'reservations_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'subscriptions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reservations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          payment_status: string | null
          price: number | null
          remaining_sessions: number | null
          start_date: string
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          payment_status?: string | null
          price?: number | null
          remaining_sessions?: number | null
          start_date: string
          status?: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          payment_status?: string | null
          price?: number | null
          remaining_sessions?: number | null
          start_date?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_waiting_list_positions: {
        Args: { course_id: string }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
