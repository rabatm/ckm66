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
          course_type: string | null
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
          one_time_date: string | null
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
          course_type?: string | null
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
          one_time_date?: string | null
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
          course_type?: string | null
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
          one_time_date?: string | null
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
      course_instances: {
        Row: {
          backup_instructor_id: string | null
          cancellation_reason: string | null
          course_id: string | null
          created_at: string | null
          current_reservations: number
          duration_minutes: number
          end_time: string
          id: string
          instance_date: string
          instructor_id: string | null
          is_exceptional: boolean | null
          is_one_time: boolean | null
          location: string
          max_capacity: number
          notes: string | null
          one_time_description: string | null
          one_time_max_participants: number | null
          one_time_title: string | null
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          backup_instructor_id?: string | null
          cancellation_reason?: string | null
          course_id?: string | null
          created_at?: string | null
          current_reservations?: number
          duration_minutes?: number
          end_time: string
          id?: string
          instance_date: string
          instructor_id?: string | null
          is_exceptional?: boolean | null
          is_one_time?: boolean | null
          location?: string
          max_capacity?: number
          notes?: string | null
          one_time_description?: string | null
          one_time_max_participants?: number | null
          one_time_title?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          backup_instructor_id?: string | null
          cancellation_reason?: string | null
          course_id?: string | null
          created_at?: string | null
          current_reservations?: number
          duration_minutes?: number
          end_time?: string
          id?: string
          instance_date?: string
          instructor_id?: string | null
          is_exceptional?: boolean | null
          is_one_time?: boolean | null
          location?: string
          max_capacity?: number
          notes?: string | null
          one_time_description?: string | null
          one_time_max_participants?: number | null
          one_time_title?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'course_instances_backup_instructor_id_fkey'
            columns: ['backup_instructor_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'course_instances_course_id_fkey'
            columns: ['course_id']
            isOneToOne: false
            referencedRelation: 'courses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'course_instances_instructor_id_fkey'
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
          attendance_rate: number
          created_at: string | null
          current_level: number
          current_streak: number
          email: string
          first_name: string
          free_trials_remaining: number | null
          id: string
          is_active: boolean | null
          join_date: string | null
          last_name: string
          longest_streak: number
          phone: string | null
          profile_picture_url: string | null
          role: string
          total_classes: number
          total_points: number
          updated_at: string | null
        }
        Insert: {
          attendance_rate?: number
          created_at?: string | null
          current_level?: number
          current_streak?: number
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          join_date?: string | null
          last_name: string
          longest_streak?: number
          phone?: string | null
          profile_picture_url?: string | null
          role?: string
          total_classes?: number
          total_points?: number
          updated_at?: string | null
        }
        Update: {
          attendance_rate?: number
          created_at?: string | null
          current_level?: number
          current_streak?: number
          email?: string
          first_name?: string
          free_trials_remaining?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string | null
          last_name?: string
          longest_streak?: number
          phone?: string | null
          profile_picture_url?: string | null
          role?: string
          total_classes?: number
          total_points?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          code: string
          created_at: string | null
          created_by: string | null
          description: string
          display_order: number
          icon_emoji: string
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          points: number
          requirement_rule: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          created_by?: string | null
          description: string
          display_order?: number
          icon_emoji: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          points?: number
          requirement_rule?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          display_order?: number
          icon_emoji?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          points?: number
          requirement_rule?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'badges_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      reservations: {
        Row: {
          attended: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          check_in_time: string | null
          check_out_time: string | null
          course_id: string | null
          course_instance_id: string | null
          created_at: string | null
          id: string
          is_free_trial: boolean | null
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
          course_instance_id?: string | null
          created_at?: string | null
          id?: string
          is_free_trial?: boolean | null
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
          course_instance_id?: string | null
          created_at?: string | null
          id?: string
          is_free_trial?: boolean | null
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
            foreignKeyName: 'reservations_course_instance_id_fkey'
            columns: ['course_instance_id']
            isOneToOne: false
            referencedRelation: 'course_instances'
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
      user_badges: {
        Row: {
          awarded_by: string | null
          badge_id: string
          coach_message: string | null
          created_at: string | null
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          awarded_by?: string | null
          badge_id: string
          coach_message?: string | null
          created_at?: string | null
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          awarded_by?: string | null
          badge_id?: string
          coach_message?: string | null
          created_at?: string | null
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_badges_awarded_by_fkey'
            columns: ['awarded_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_badges_badge_id_fkey'
            columns: ['badge_id']
            isOneToOne: false
            referencedRelation: 'badges'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_badges_user_id_fkey'
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
      check_and_unlock_badges: {
        Args: { p_user_id: string }
        Returns: Array<{
          newly_unlocked_count: number
          newly_unlocked_badges: Array<{
            badge_id: string
            code: string
            name: string
            points: number
          }>
        }>
      }
      create_one_time_course_instance: {
        Args: {
          p_title: string
          p_description: string
          p_scheduled_date: string
          p_start_time: string
          p_end_time: string
          p_max_participants: number
          p_instructor_id: string
          p_location: string
          p_duration_minutes?: number
        }
        Returns: string
      }
      decrement_course_reservations: {
        Args: { course_id: string }
        Returns: undefined
      }
      decrement_instance_reservations: {
        Args: { instance_id: string }
        Returns: undefined
      }
      generate_all_course_instances: {
        Args: { p_weeks_ahead?: number }
        Returns: Array<{
          course_id: string
          instances_created: number
        }>
      }
      generate_course_instances: {
        Args: { p_course_id: string; p_weeks_ahead?: number }
        Returns: number
      }
      increment_course_reservations: {
        Args: { course_id: string }
        Returns: undefined
      }
      increment_instance_reservations: {
        Args: { instance_id: string }
        Returns: undefined
      }
      update_waiting_list_positions: {
        Args: { course_id: string }
        Returns: undefined
      }
      update_instance_waiting_list_positions: {
        Args: { instance_id: string }
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
