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
      directories: {
        Row: {
          active: boolean
          auto_submit_config: Json | null
          category: string
          created_at: string
          domain_authority: number | null
          homepage_url: string
          id: string
          name: string
          notes: string | null
          slug: string
          submission_method: string
          submit_url: string
          tier: number
        }
        Insert: {
          active?: boolean
          auto_submit_config?: Json | null
          category: string
          created_at?: string
          domain_authority?: number | null
          homepage_url: string
          id?: string
          name: string
          notes?: string | null
          slug: string
          submission_method?: string
          submit_url: string
          tier?: number
        }
        Update: {
          active?: boolean
          auto_submit_config?: Json | null
          category?: string
          created_at?: string
          domain_authority?: number | null
          homepage_url?: string
          id?: string
          name?: string
          notes?: string | null
          slug?: string
          submission_method?: string
          submit_url?: string
          tier?: number
        }
        Relationships: []
      }
      directory_queue_runs: {
        Row: {
          errors: Json | null
          id: string
          ran_at: string
          submissions_auto: number
          submissions_queued: number
          workspaces_processed: number
        }
        Insert: {
          errors?: Json | null
          id?: string
          ran_at?: string
          submissions_auto?: number
          submissions_queued?: number
          workspaces_processed?: number
        }
        Update: {
          errors?: Json | null
          id?: string
          ran_at?: string
          submissions_auto?: number
          submissions_queued?: number
          workspaces_processed?: number
        }
        Relationships: []
      }
      directory_submissions: {
        Row: {
          auto_result: Json | null
          created_at: string
          directory_id: string
          id: string
          live_url: string | null
          notes: string | null
          scheduled_for: string
          status: string
          submitted_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          auto_result?: Json | null
          created_at?: string
          directory_id: string
          id?: string
          live_url?: string | null
          notes?: string | null
          scheduled_for?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          auto_result?: Json | null
          created_at?: string
          directory_id?: string
          id?: string
          live_url?: string | null
          notes?: string | null
          scheduled_for?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_submissions_directory_id_fkey"
            columns: ["directory_id"]
            isOneToOne: false
            referencedRelation: "directories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directory_submissions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      github_app_installations: {
        Row: {
          account_login: string | null
          account_type: string | null
          created_at: string
          installation_id: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          account_login?: string | null
          account_type?: string | null
          created_at?: string
          installation_id: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          account_login?: string | null
          account_type?: string | null
          created_at?: string
          installation_id?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_app_installations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_oauth_tokens: {
        Row: {
          access_token: string
          connected_account_id: string
          created_at: string
          expires_at: string | null
          linkedin_member_id: string
          refresh_token: string | null
          scope: string | null
          token_type: string
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_account_id: string
          created_at?: string
          expires_at?: string | null
          linkedin_member_id: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_account_id?: string
          created_at?: string
          expires_at?: string | null
          linkedin_member_id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_oauth_tokens_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: true
            referencedRelation: "connected_accounts"
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
      meta_oauth_tokens: {
        Row: {
          access_token: string
          connected_account_id: string
          created_at: string
          expires_at: string | null
          id: string
          ig_business_id: string | null
          kind: string
          meta_user_id: string | null
          page_id: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_account_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ig_business_id?: string | null
          kind: string
          meta_user_id?: string | null
          page_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_account_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          ig_business_id?: string | null
          kind?: string
          meta_user_id?: string | null
          page_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_oauth_tokens_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: true
            referencedRelation: "connected_accounts"
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
      seo_clients: {
        Row: {
          baseline_captured_at: string | null
          baseline_clicks: number
          baseline_date: string
          baseline_impressions: number
          baseline_indexed: number
          created_at: string
          id: string
          name: string
          report_token: string
          website: string
          workspace_id: string | null
        }
        Insert: {
          baseline_captured_at?: string | null
          baseline_clicks?: number
          baseline_date?: string
          baseline_impressions?: number
          baseline_indexed?: number
          created_at?: string
          id?: string
          name: string
          report_token?: string
          website: string
          workspace_id?: string | null
        }
        Update: {
          baseline_captured_at?: string | null
          baseline_clicks?: number
          baseline_date?: string
          baseline_impressions?: number
          baseline_indexed?: number
          created_at?: string
          id?: string
          name?: string
          report_token?: string
          website?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_gsc_connections: {
        Row: {
          active: boolean
          client_id: string
          created_at: string
          last_error: string | null
          last_synced_at: string | null
          property_url: string
          refresh_token: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_id: string
          created_at?: string
          last_error?: string | null
          last_synced_at?: string | null
          property_url: string
          refresh_token: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_id?: string
          created_at?: string
          last_error?: string | null
          last_synced_at?: string | null
          property_url?: string
          refresh_token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_gsc_connections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "seo_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_leads: {
        Row: {
          business_desc: string | null
          competitors: string[] | null
          completed: boolean | null
          created_at: string
          current_step: number | null
          email: string | null
          gsc_connected: boolean | null
          id: string
          indexed_pages: string | null
          language: string | null
          monthly_clicks: string | null
          name: string | null
          target_audience: string[] | null
          target_market: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          business_desc?: string | null
          competitors?: string[] | null
          completed?: boolean | null
          created_at?: string
          current_step?: number | null
          email?: string | null
          gsc_connected?: boolean | null
          id: string
          indexed_pages?: string | null
          language?: string | null
          monthly_clicks?: string | null
          name?: string | null
          target_audience?: string[] | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_desc?: string | null
          competitors?: string[] | null
          completed?: boolean | null
          created_at?: string
          current_step?: number | null
          email?: string | null
          gsc_connected?: boolean | null
          id?: string
          indexed_pages?: string | null
          language?: string | null
          monthly_clicks?: string | null
          name?: string | null
          target_audience?: string[] | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      seo_metrics_daily: {
        Row: {
          clicks: number
          client_id: string
          day: string
          id: number
          impressions: number
          indexed_pages: number | null
        }
        Insert: {
          clicks?: number
          client_id: string
          day: string
          id?: never
          impressions?: number
          indexed_pages?: number | null
        }
        Update: {
          clicks?: number
          client_id?: string
          day?: string
          id?: never
          impressions?: number
          indexed_pages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_metrics_daily_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "seo_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_semrush_snapshots: {
        Row: {
          authority_score: number | null
          client_id: string
          created_at: string
          day: string
          domain: string
          id: string
          lost_backlinks: number | null
          new_backlinks: number | null
          organic_keywords: number | null
          organic_traffic: number | null
          raw: Json | null
          referring_domains: number | null
          sync_error: string | null
          sync_status: string
          synced_at: string
          total_backlinks: number | null
        }
        Insert: {
          authority_score?: number | null
          client_id: string
          created_at?: string
          day: string
          domain: string
          id?: string
          lost_backlinks?: number | null
          new_backlinks?: number | null
          organic_keywords?: number | null
          organic_traffic?: number | null
          raw?: Json | null
          referring_domains?: number | null
          sync_error?: string | null
          sync_status?: string
          synced_at?: string
          total_backlinks?: number | null
        }
        Update: {
          authority_score?: number | null
          client_id?: string
          created_at?: string
          day?: string
          domain?: string
          id?: string
          lost_backlinks?: number | null
          new_backlinks?: number | null
          organic_keywords?: number | null
          organic_traffic?: number | null
          raw?: Json | null
          referring_domains?: number | null
          sync_error?: string | null
          sync_status?: string
          synced_at?: string
          total_backlinks?: number | null
        }
        Relationships: []
      }
      tiktok_oauth_tokens: {
        Row: {
          access_token: string
          connected_account_id: string
          created_at: string
          expires_at: string
          id: string
          open_id: string
          refresh_expires_at: string | null
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
        }
        Insert: {
          access_token: string
          connected_account_id: string
          created_at?: string
          expires_at: string
          id?: string
          open_id: string
          refresh_expires_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string
          connected_account_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          open_id?: string
          refresh_expires_at?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_oauth_tokens_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: true
            referencedRelation: "connected_accounts"
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
      website_connections: {
        Row: {
          created_at: string
          display_name: string | null
          encrypted_credentials: string | null
          external_id: string
          id: string
          last_error: string | null
          last_tested_at: string | null
          metadata: Json
          platform: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          encrypted_credentials?: string | null
          external_id: string
          id?: string
          last_error?: string | null
          last_tested_at?: string | null
          metadata?: Json
          platform: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          encrypted_credentials?: string | null
          external_id?: string
          id?: string
          last_error?: string | null
          last_tested_at?: string | null
          metadata?: Json
          platform?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      website_publish_jobs: {
        Row: {
          connection_id: string
          created_at: string
          error_message: string | null
          excerpt: string | null
          external_id: string | null
          external_url: string | null
          html: string
          id: string
          metadata: Json
          processed_at: string | null
          publish_mode: string
          slug: string
          status: string
          title: string
          workspace_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          error_message?: string | null
          excerpt?: string | null
          external_id?: string | null
          external_url?: string | null
          html: string
          id?: string
          metadata?: Json
          processed_at?: string | null
          publish_mode?: string
          slug: string
          status?: string
          title: string
          workspace_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          error_message?: string | null
          excerpt?: string | null
          external_id?: string | null
          external_url?: string | null
          html?: string
          id?: string
          metadata?: Json
          processed_at?: string | null
          publish_mode?: string
          slug?: string
          status?: string
          title?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_publish_jobs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "website_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "website_publish_jobs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_directory_profile: {
        Row: {
          category: string | null
          contact_email: string | null
          created_at: string
          founder_name: string | null
          launch_date: string | null
          logo_url: string | null
          long_description: string | null
          pricing_model: string | null
          product_name: string | null
          short_description: string | null
          tagline: string | null
          twitter_handle: string | null
          updated_at: string
          website_url: string | null
          workspace_id: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          founder_name?: string | null
          launch_date?: string | null
          logo_url?: string | null
          long_description?: string | null
          pricing_model?: string | null
          product_name?: string | null
          short_description?: string | null
          tagline?: string | null
          twitter_handle?: string | null
          updated_at?: string
          website_url?: string | null
          workspace_id: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          created_at?: string
          founder_name?: string | null
          launch_date?: string | null
          logo_url?: string | null
          long_description?: string | null
          pricing_model?: string | null
          product_name?: string | null
          short_description?: string | null
          tagline?: string | null
          twitter_handle?: string | null
          updated_at?: string
          website_url?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_directory_profile_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
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
        | "action_required"
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
        "action_required",
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
