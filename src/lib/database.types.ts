export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      author: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
      };
      playlist: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
        };
      };
      song: {
        Row: {
          album: string | null;
          author_id: string;
          id: string;
          link: string;
          title: string;
        };
        Insert: {
          album?: string | null;
          author_id: string;
          id?: string;
          link: string;
          title?: string;
        };
        Update: {
          album?: string | null;
          author_id?: string;
          id?: string;
          link?: string;
          title?: string;
        };
      };
      songs: {
        Row: {
          created_at: string | null;
          id: string;
          playlist_id: string;
          song_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          playlist_id: string;
          song_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          playlist_id?: string;
          song_id?: string;
        };
      };
    };
  };
}
