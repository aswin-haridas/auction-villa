export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Auction: {
        Row: {
          buyout_price: number | null
          category: string | null
          end_time: string | null
          highest_bid: number | null
          highest_bidder: string | null
          id: string
          image: string[] | null
          name: string | null
          owner: string | null
          price: number | null
          status: string | null
          winner: string | null
        }
        Insert: {
          buyout_price?: number | null
          category?: string | null
          end_time?: string | null
          highest_bid?: number | null
          highest_bidder?: string | null
          id?: string
          image?: string[] | null
          name?: string | null
          owner?: string | null
          price?: number | null
          status?: string | null
          winner?: string | null
        }
        Update: {
          buyout_price?: number | null
          category?: string | null
          end_time?: string | null
          highest_bid?: number | null
          highest_bidder?: string | null
          id?: string
          image?: string[] | null
          name?: string | null
          owner?: string | null
          price?: number | null
          status?: string | null
          winner?: string | null
        }
        Relationships: []
      }
      Bid: {
        Row: {
          amount: number | null
          auction_id: string | null
          bid_id: string
          timestamp: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          amount?: number | null
          auction_id?: string | null
          bid_id?: string
          timestamp?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          amount?: number | null
          auction_id?: string | null
          bid_id?: string
          timestamp?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Bid_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "Auction"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Bid_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Painting: {
        Row: {
          acqire_price: number | null
          acquire_date: string | null
          acquire_price: number | null
          at_work: boolean | null
          category: string | null
          images: string[] | null
          is_for_rent: boolean | null
          is_for_trade: boolean | null
          is_rented: boolean | null
          name: string | null
          owner: string | null
          painting_id: string
          rental_end_date: string | null
          rental_price: number | null
          rented_by: string | null
          status: string | null
          working_time: number | null
        }
        Insert: {
          acqire_price?: number | null
          acquire_date?: string | null
          acquire_price?: number | null
          at_work?: boolean | null
          category?: string | null
          images?: string[] | null
          is_for_rent?: boolean | null
          is_for_trade?: boolean | null
          is_rented?: boolean | null
          name?: string | null
          owner?: string | null
          painting_id?: string
          rental_end_date?: string | null
          rental_price?: number | null
          rented_by?: string | null
          status?: string | null
          working_time?: number | null
        }
        Update: {
          acqire_price?: number | null
          acquire_date?: string | null
          acquire_price?: number | null
          at_work?: boolean | null
          category?: string | null
          images?: string[] | null
          is_for_rent?: boolean | null
          is_for_trade?: boolean | null
          is_rented?: boolean | null
          name?: string | null
          owner?: string | null
          painting_id?: string
          rental_end_date?: string | null
          rental_price?: number | null
          rented_by?: string | null
          status?: string | null
          working_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Painting_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Transactions: {
        Row: {
          amount: number | null
          event: string | null
          id: number
          timestamp: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          event?: string | null
          id?: number
          timestamp?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          event?: string | null
          id?: number
          timestamp?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Bank_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      User: {
        Row: {
          balance: number | null
          created_at: string
          password: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string
          password?: string | null
          user_id?: string
          username?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string
          password?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buy_out_item: {
        Args: { p_username: string; p_item_id: string; p_buyout_price: number }
        Returns: undefined
      }
      place_bid: {
        Args: { p_amount: number; p_item_id: string; p_username: string }
        Returns: undefined
      }
      update_balance: {
        Args: { p_user_id: string; p_amount: number }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
