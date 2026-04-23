export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      protocols: {
        Row: {
          id: string
          slug: string
          title: string
          type: 'agudo' | 'cronico' | 'neuropatico' | 'oncologico' | 'intervencionismo'
          status: 'published' | 'draft' | 'review_pending' | 'archived'
          current_version_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          type: 'agudo' | 'cronico' | 'neuropatico' | 'oncologico' | 'intervencionismo'
          status?: 'published' | 'draft' | 'review_pending' | 'archived'
          current_version_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          type?: 'agudo' | 'cronico' | 'neuropatico' | 'oncologico' | 'intervencionismo'
          status?: 'published' | 'draft' | 'review_pending' | 'archived'
          current_version_id?: string | null
          updated_at?: string
        }
      }
      protocol_versions: {
        Row: {
          id: string
          protocol_id: string
          version_number: number
          content: Json
          bibliography: Json
          generated_by: 'manual' | 'claude-api'
          approved_by: string | null
          approved_at: string | null
          published_at: string | null
          search_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          protocol_id: string
          version_number: number
          content: Json
          bibliography?: Json
          generated_by?: 'manual' | 'claude-api'
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          search_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          protocol_id?: string
          version_number?: number
          content?: Json
          bibliography?: Json
          generated_by?: 'manual' | 'claude-api'
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          search_summary?: string | null
          created_at?: string
        }
      }
      protocol_update_jobs: {
        Row: {
          id: string
          protocol_id: string
          triggered_at: string
          status: 'running' | 'draft_ready' | 'approved' | 'rejected' | 'error'
          sources_searched: Json | null
          draft_version_id: string | null
          error_message: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          protocol_id: string
          triggered_at?: string
          status?: 'running' | 'draft_ready' | 'approved' | 'rejected' | 'error'
          sources_searched?: Json | null
          draft_version_id?: string | null
          error_message?: string | null
          completed_at?: string | null
        }
        Update: {
          status?: 'running' | 'draft_ready' | 'approved' | 'rejected' | 'error'
          sources_searched?: Json | null
          draft_version_id?: string | null
          error_message?: string | null
          completed_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'medico' | 'enfermera' | 'directivo'
          full_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'medico' | 'enfermera' | 'directivo'
          full_name: string
          created_at?: string
        }
        Update: {
          role?: 'admin' | 'medico' | 'enfermera' | 'directivo'
          full_name?: string
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}
