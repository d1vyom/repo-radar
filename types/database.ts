export type Database = {
  public: {
    Tables: {
      repositories: {
        Row: {
          id: string;
          github_id: number;
          full_name: string;
          name: string;
          owner_login: string;
          owner_avatar_url: string;
          description: string | null;
          language: string | null;
          topics: string[];
          stars_count: number;
          forks_count: number;
          issues_count: number;
          github_created_at: string;
          github_updated_at: string;
          github_pushed_at: string;
          license_spdx: string | null;
          is_archived: boolean;
          last_synced_at: string;
        };
        Insert: {
          id?: string;
          github_id: number;
          full_name: string;
          name: string;
          owner_login: string;
          owner_avatar_url: string;
          description?: string | null;
          language?: string | null;
          topics?: string[];
          stars_count?: number;
          forks_count?: number;
          issues_count?: number;
          github_created_at: string;
          github_updated_at: string;
          github_pushed_at: string;
          license_spdx?: string | null;
          is_archived?: boolean;
          last_synced_at?: string;
        };
        Update: {
          id?: string;
          github_id?: number;
          full_name?: string;
          name?: string;
          owner_login?: string;
          owner_avatar_url?: string;
          description?: string | null;
          language?: string | null;
          topics?: string[];
          stars_count?: number;
          forks_count?: number;
          issues_count?: number;
          github_created_at?: string;
          github_updated_at?: string;
          github_pushed_at?: string;
          license_spdx?: string | null;
          is_archived?: boolean;
          last_synced_at?: string;
        };
        Relationships: [];
      };
      repository_snapshots: {
        Row: {
          id: string;
          repository_id: string;
          snapshot_date: string;
          stars_count: number;
          forks_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          repository_id: string;
          snapshot_date: string;
          stars_count: number;
          forks_count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          repository_id?: string;
          snapshot_date?: string;
          stars_count?: number;
          forks_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      domains: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      repository_domains: {
        Row: {
          repository_id: string;
          domain_id: string;
        };
        Insert: {
          repository_id: string;
          domain_id: string;
        };
        Update: {
          repository_id?: string;
          domain_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
