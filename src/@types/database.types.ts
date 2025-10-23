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
      account_deletion_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          delete_all_data: boolean | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          delete_all_data?: boolean | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          delete_all_data?: boolean | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          attendance_date: string | null
          attended: boolean | null
          course_id: string | null
          course_instance_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attendance_date?: string | null
          attended?: boolean | null
          course_id?: string | null
          course_instance_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_date?: string | null
          attended?: boolean | null
          course_id?: string | null
          course_instance_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_course_instance_id_fkey"
            columns: ["course_instance_id"]
            isOneToOne: false
            referencedRelation: "course_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          code: string
          created_at: string | null
          created_by: string | null
          description: string
          display_order: number | null
          icon_emoji: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          points: number | null
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
          display_order?: number | null
          icon_emoji: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          points?: number | null
          requirement_rule?: Json | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          display_order?: number | null
          icon_emoji?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          points?: number | null
          requirement_rule?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_instances: {
        Row: {
          backup_instructor_id: string | null
          cancellation_reason: string | null
          course_id: string
          created_at: string | null
          current_reservations: number | null
          duration_minutes: number
          end_time: string
          id: string
          instance_date: string
          instructor_id: string
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
          course_id: string
          created_at?: string | null
          current_reservations?: number | null
          duration_minutes: number
          end_time: string
          id?: string
          instance_date: string
          instructor_id: string
          is_exceptional?: boolean | null
          is_one_time?: boolean | null
          location: string
          max_capacity: number
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
          course_id?: string
          created_at?: string | null
          current_reservations?: number | null
          duration_minutes?: number
          end_time?: string
          id?: string
          instance_date?: string
          instructor_id?: string
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
            foreignKeyName: "course_instances_backup_instructor_id_fkey"
            columns: ["backup_instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instances_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_instances_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          backup_instructor_id: string | null
          course_type: string
          created_at: string | null
          created_by: string | null
          current_reservations: number | null
          day_of_week: number | null
          description: string | null
          duration_minutes: number
          end_time: string
          id: string
          instructor_id: string
          is_active: boolean | null
          is_recurring: boolean | null
          level: string
          location: string
          max_age: number | null
          max_capacity: number
          min_age: number | null
          one_time_date: string | null
          prerequisites: string[] | null
          recurrence_end: string | null
          recurrence_pattern: Json | null
          recurrence_start: string | null
          required_equipment: string[] | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          backup_instructor_id?: string | null
          course_type?: string
          created_at?: string | null
          created_by?: string | null
          current_reservations?: number | null
          day_of_week?: number | null
          description?: string | null
          duration_minutes: number
          end_time: string
          id?: string
          instructor_id: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          level?: string
          location: string
          max_age?: number | null
          max_capacity?: number
          min_age?: number | null
          one_time_date?: string | null
          prerequisites?: string[] | null
          recurrence_end?: string | null
          recurrence_pattern?: Json | null
          recurrence_start?: string | null
          required_equipment?: string[] | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          backup_instructor_id?: string | null
          course_type?: string
          created_at?: string | null
          created_by?: string | null
          current_reservations?: number | null
          day_of_week?: number | null
          description?: string | null
          duration_minutes?: number
          end_time?: string
          id?: string
          instructor_id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          level?: string
          location?: string
          max_age?: number | null
          max_capacity?: number
          min_age?: number | null
          one_time_date?: string | null
          prerequisites?: string[] | null
          recurrence_end?: string | null
          recurrence_pattern?: Json | null
          recurrence_start?: string | null
          required_equipment?: string[] | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_backup_instructor_id_fkey"
            columns: ["backup_instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_deliveries: {
        Row: {
          delivered_at: string
          expo_receipt_id: string | null
          message_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          delivered_at?: string
          expo_receipt_id?: string | null
          message_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          delivered_at?: string
          expo_receipt_id?: string | null
          message_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_deliveries_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          created_at: string | null
          message_id: string
          read_at: string
          received_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          message_id: string
          read_at?: string
          received_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          message_id?: string
          read_at?: string
          received_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string
          id: string
          is_system: boolean | null
          sent_by: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          sent_by?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          sent_by?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "notification_queue_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_queue_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          attendance_rate: number | null
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          email: string
          expo_push_token: string | null
          fcm_token: string | null
          first_name: string | null
          free_trial_granted_at: string | null
          free_trial_granted_by: string | null
          free_trials_granted: number | null
          free_trials_remaining: number | null
          id: string
          is_active: boolean | null
          is_new_user: boolean | null
          join_date: string | null
          last_name: string | null
          longest_streak: number | null
          phone: string | null
          profile_picture_url: string | null
          role: string
          total_classes: number | null
          total_points: number | null
          updated_at: string | null
        }
        Insert: {
          attendance_rate?: number | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          email: string
          expo_push_token?: string | null
          fcm_token?: string | null
          first_name?: string | null
          free_trial_granted_at?: string | null
          free_trial_granted_by?: string | null
          free_trials_granted?: number | null
          free_trials_remaining?: number | null
          id: string
          is_active?: boolean | null
          is_new_user?: boolean | null
          join_date?: string | null
          last_name?: string | null
          longest_streak?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          role?: string
          total_classes?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Update: {
          attendance_rate?: number | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          email?: string
          expo_push_token?: string | null
          fcm_token?: string | null
          first_name?: string | null
          free_trial_granted_at?: string | null
          free_trial_granted_by?: string | null
          free_trials_granted?: number | null
          free_trials_remaining?: number | null
          id?: string
          is_active?: boolean | null
          is_new_user?: boolean | null
          join_date?: string | null
          last_name?: string | null
          longest_streak?: number | null
          phone?: string | null
          profile_picture_url?: string | null
          role?: string
          total_classes?: number | null
          total_points?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_free_trial_granted_by_fkey"
            columns: ["free_trial_granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          course_instance_id: string
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
          user_id: string
          waiting_list_position: number | null
        }
        Insert: {
          attended?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          course_id?: string | null
          course_instance_id: string
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
          user_id: string
          waiting_list_position?: number | null
        }
        Update: {
          attended?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          course_id?: string | null
          course_instance_id?: string
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
          user_id?: string
          waiting_list_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_course_instance_id_fkey"
            columns: ["course_instance_id"]
            isOneToOne: false
            referencedRelation: "course_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          initial_sessions: number | null
          is_active: boolean | null
          payment_status: string
          price: number
          remaining_sessions: number | null
          start_date: string
          status: string
          type: string
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          initial_sessions?: number | null
          is_active?: boolean | null
          payment_status?: string
          price: number
          remaining_sessions?: number | null
          start_date: string
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          initial_sessions?: number | null
          is_active?: boolean | null
          payment_status?: string
          price?: number
          remaining_sessions?: number | null
          start_date?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "user_badges_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_level:
        | {
            Args: { points: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.calculate_level(points => int8), public.calculate_level(points => int4). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { points: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.calculate_level(points => int8), public.calculate_level(points => int4). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      check_and_unlock_badges: {
        Args: { p_user_id: string }
        Returns: {
          newly_unlocked_badges: Json
          newly_unlocked_count: number
        }[]
      }
      generate_course_instances: {
        Args: { p_course_id: string; p_weeks_ahead?: number }
        Returns: number
      }
      get_my_claim: { Args: { claim: string }; Returns: Json }
      grant_free_trials: {
        Args: { p_granted_by: string; p_guest_id: string; p_num_trials: number }
        Returns: undefined
      }
      is_claims_admin: { Args: never; Returns: boolean }
      recalculate_all_user_levels: { Args: never; Returns: undefined }
      recalculate_user_level: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_all_new_user_statuses: { Args: never; Returns: undefined }
      update_new_user_status: { Args: { user_id: string }; Returns: undefined }
      use_free_trial: {
        Args: { p_guest_id: string; p_reservation_id: string }
        Returns: boolean
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
