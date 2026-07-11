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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      connected_accounts: {
        Row: {
          avatar_url: string | null
          connected_by: string | null
          created_at: string
          display_name: string | null
          error_message: string | null
          external_id: string | null
          handle: string | null
          id: string
          last_synced_at: string | null
          metadata: Json
          platform: Database["public"]["Enums"]["social_platform"]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
          workspace_id: string
          zernio_account_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          connected_by?: string | null
          created_at?: string
          display_name?: string | null
          error_message?: string | null
          external_id?: string | null
          handle?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json
          platform: Database["public"]["Enums"]["social_platform"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          workspace_id: string
          zernio_account_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          connected_by?: string | null
          created_at?: string
          display_name?: string | null
          error_message?: string | null
          external_id?: string | null
          handle?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json
          platform?: Database["public"]["Enums"]["social_platform"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
          workspace_id?: string
          zernio_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          duration_seconds: number | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          mime_type: string | null
          original_name: string | null
          size_bytes: number | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          provider: string
          redirect_origin: string
          state: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          provider: string
          redirect_origin: string
          state: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          provider?: string
          redirect_origin?: string
          state?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_states_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      post_targets: {
        Row: {
          connected_account_id: string
          created_at: string
          error_message: string | null
          external_post_id: string | null
          external_url: string | null
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          post_id: string
          published_at: string | null
          status: Database["public"]["Enums"]["target_status"]
          updated_at: string
        }
        Insert: {
          connected_account_id: string
          created_at?: string
          error_message?: string | null
          external_post_id?: string | null
          external_url?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          post_id: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["target_status"]
          updated_at?: string
        }
        Update: {
          connected_account_id?: string
          created_at?: string
          error_message?: string | null
          external_post_id?: string | null
          external_url?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          post_id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["target_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_targets_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_targets_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          media_asset_ids: string[]
          per_platform_overrides: Json
          published_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["post_status"]
          updated_at: string
          workspace_id: string
          zernio_post_id: string | null
        }
        Insert: {
          caption?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          media_asset_ids?: string[]
          per_platform_overrides?: Json
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          workspace_id: string
          zernio_post_id?: string | null
        }
        Update: {
          caption?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          media_asset_ids?: string[]
          per_platform_overrides?: Json
          published_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          updated_at?: string
          workspace_id?: string
          zernio_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_workspace_id: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_workspace_id?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_workspace_id?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_workspace_fk"
            columns: ["current_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      publish_attempts: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          post_target_id: string
          request_payload: Json | null
          response_payload: Json | null
          status: Database["public"]["Enums"]["target_status"]
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          post_target_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          status: Database["public"]["Enums"]["target_status"]
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          post_target_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["target_status"]
        }
        Relationships: [
          {
            foreignKeyName: "publish_attempts_post_target_id_fkey"
            columns: ["post_target_id"]
            isOneToOne: false
            referencedRelation: "post_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
          slug: string
          updated_at: string
          watermark: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
          slug: string
          updated_at?: string
          watermark?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          watermark?: Json
        }
        Relationships: []
      }
      youtube_oauth_tokens: {
        Row: {
          access_token: string
          channel_id: string | null
          connected_account_id: string
          created_at: string
          expires_at: string
          google_user_id: string | null
          id: string
          refresh_token: string | null
          scope: string | null
          token_type: string
          updated_at: string
        }
        Insert: {
          access_token: string
          channel_id?: string | null
          connected_account_id: string
          created_at?: string
          expires_at: string
          google_user_id?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          channel_id?: string | null
          connected_account_id?: string
          created_at?: string
          expires_at?: string
          google_user_id?: string | null
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "youtube_oauth_tokens_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: true
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      workspace_role_of: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
    }
    Enums: {
      account_status: "connected" | "disconnected" | "error" | "pending"
      app_role: "admin" | "user"
      media_kind: "image" | "video"
      post_status:
        | "draft"
        | "scheduled"
        | "publishing"
        | "published"
        | "partial"
        | "failed"
        | "cancelled"
      social_platform:
        | "youtube"
        | "x"
        | "instagram"
        | "facebook"
        | "pinterest"
        | "linkedin"
        | "tiktok"
        | "threads"
        | "bluesky"
        | "reddit"
        | "google_business"
      target_status:
        | "pending"
        | "publishing"
        | "published"
        | "failed"
        | "cancelled"
      workspace_role: "owner" | "admin" | "member"
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
      account_status: ["connected", "disconnected", "error", "pending"],
      app_role: ["admin", "user"],
      media_kind: ["image", "video"],
      post_status: [
        "draft",
        "scheduled",
        "publishing",
        "published",
        "partial",
        "failed",
        "cancelled",
      ],
      social_platform: [
        "youtube",
        "x",
        "instagram",
        "facebook",
        "pinterest",
        "linkedin",
        "tiktok",
        "threads",
        "bluesky",
        "reddit",
        "google_business",
      ],
      target_status: [
        "pending",
        "publishing",
        "published",
        "failed",
        "cancelled",
      ],
      workspace_role: ["owner", "admin", "member"],
    },
  },
} as const
