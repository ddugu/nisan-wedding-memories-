export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      memories: {
        Row: {
          id: string;
          created_at: string;
          guest_name: string | null;
          message: string | null;
          image_path: string | null;
          image_url: string | null;
          file_size: number;
          mime_type: string | null;
          status: string;
          uploader_ip_hash: string | null;
          photos: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          guest_name?: string | null;
          message?: string | null;
          image_path?: string | null;
          image_url?: string | null;
          file_size?: number;
          mime_type?: string | null;
          status?: string;
          uploader_ip_hash?: string | null;
          photos?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          guest_name?: string | null;
          message?: string | null;
          image_path?: string | null;
          image_url?: string | null;
          file_size?: number;
          mime_type?: string | null;
          status?: string;
          uploader_ip_hash?: string | null;
          photos?: Json;
        };
        Relationships: [];
      };
      storage_stats: {
        Row: {
          id: number;
          total_used_bytes: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          total_used_bytes?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          total_used_bytes?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      reserve_storage_space: {
        Args: { incoming_size: number; max_total_bytes: number };
        Returns: boolean;
      };
      release_storage_space: {
        Args: { released_size: number };
        Returns: void;
      };
      get_storage_usage: {
        Args: Record<string, never>;
        Returns: number;
      };
      count_photos_by_uploader: {
        Args: { ip_hash: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
