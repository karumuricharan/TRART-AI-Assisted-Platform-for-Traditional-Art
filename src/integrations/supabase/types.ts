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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      art_requests: {
        Row: {
          ai_preview_images: string[]
          ai_suggested_price: number | null
          art_style: string
          art_type: string
          artist_id: string | null
          artist_price: number | null
          budget_max: number
          budget_min: number
          created_at: string
          customer_counter_price: number | null
          customer_id: string
          delivery_address_line1: string | null
          delivery_address_line2: string | null
          delivery_booked_at: string | null
          delivery_city: string | null
          delivery_phone: string | null
          delivery_pincode: string | null
          delivery_provider: string | null
          delivery_state: string | null
          delivery_tracking_id: string | null
          description: string
          final_price: number | null
          final_prompt: string | null
          height: number
          id: string
          medium: string
          reference_images: string[]
          selected_preview: string | null
          status: string
          updated_at: string
          width: number
        }
        Insert: {
          ai_preview_images?: string[]
          ai_suggested_price?: number | null
          art_style: string
          art_type: string
          artist_id?: string | null
          artist_price?: number | null
          budget_max: number
          budget_min: number
          created_at?: string
          customer_counter_price?: number | null
          customer_id: string
          delivery_address_line1?: string | null
          delivery_address_line2?: string | null
          delivery_booked_at?: string | null
          delivery_city?: string | null
          delivery_phone?: string | null
          delivery_pincode?: string | null
          delivery_provider?: string | null
          delivery_state?: string | null
          delivery_tracking_id?: string | null
          description: string
          final_price?: number | null
          final_prompt?: string | null
          height: number
          id?: string
          medium: string
          reference_images?: string[]
          selected_preview?: string | null
          status?: string
          updated_at?: string
          width: number
        }
        Update: {
          ai_preview_images?: string[]
          ai_suggested_price?: number | null
          art_style?: string
          art_type?: string
          artist_id?: string | null
          artist_price?: number | null
          budget_max?: number
          budget_min?: number
          created_at?: string
          customer_counter_price?: number | null
          customer_id?: string
          delivery_address_line1?: string | null
          delivery_address_line2?: string | null
          delivery_booked_at?: string | null
          delivery_city?: string | null
          delivery_phone?: string | null
          delivery_pincode?: string | null
          delivery_provider?: string | null
          delivery_state?: string | null
          delivery_tracking_id?: string | null
          description?: string
          final_price?: number | null
          final_prompt?: string | null
          height?: number
          id?: string
          medium?: string
          reference_images?: string[]
          selected_preview?: string | null
          status?: string
          updated_at?: string
          width?: number
        }
        Relationships: []
      }
      artist_profiles: {
        Row: {
          bio: string
          created_at: string
          experience_years: number
          id: string
          portfolio_images: string[]
          rating: number
          specializations: string[]
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string
          created_at?: string
          experience_years?: number
          id?: string
          portfolio_images?: string[]
          rating?: number
          specializations?: string[]
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          created_at?: string
          experience_years?: number
          id?: string
          portfolio_images?: string[]
          rating?: number
          specializations?: string[]
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          pincode: string | null
          role: Database["public"]["Enums"]["app_role"]
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          pincode?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          pincode?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "artist"
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
      app_role: ["customer", "artist"],
    },
  },
} as const
