export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          created_at?: string
        }
      }
      api_credentials: {
        Row: {
          id: string
          user_id: string
          exchange: string
          api_key: string
          api_secret: string
          passphrase: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exchange: string
          api_key: string
          api_secret: string
          passphrase?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exchange?: string
          api_key?: string
          api_secret?: string
          passphrase?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          symbol: string
          side: "buy" | "sell"
          amount: number
          price: number
          status: "pending" | "completed" | "cancelled"
          confidence: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol: string
          side: "buy" | "sell"
          amount: number
          price: number
          status?: "pending" | "completed" | "cancelled"
          confidence: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol?: string
          side?: "buy" | "sell"
          amount?: number
          price?: number
          status?: "pending" | "completed" | "cancelled"
          confidence?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          auto_trading: boolean
          confidence_threshold: number
          max_trade_size: number
          stop_loss: number
          take_profit: number
          paper_trading: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          auto_trading?: boolean
          confidence_threshold?: number
          max_trade_size?: number
          stop_loss?: number
          take_profit?: number
          paper_trading?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          auto_trading?: boolean
          confidence_threshold?: number
          max_trade_size?: number
          stop_loss?: number
          take_profit?: number
          paper_trading?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
