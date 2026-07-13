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
      accounts: {
        Row: {
          color: string | null
          created_at: string
          currency: string
          id: string
          initial_balance: number
          institution: string | null
          is_archived: boolean
          name: string
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          institution?: string | null
          is_archived?: boolean
          name: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          initial_balance?: number
          institution?: string | null
          is_archived?: boolean
          name?: string
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          id: string
          month_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          id?: string
          month_ref: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          id?: string
          month_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string | null
          brand: string | null
          closing_day: number | null
          color: string | null
          created_at: string
          credit_limit: number | null
          due_day: number | null
          id: string
          is_archived: boolean
          last4: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          brand?: string | null
          closing_day?: number | null
          color?: string | null
          created_at?: string
          credit_limit?: number | null
          due_day?: number | null
          id?: string
          is_archived?: boolean
          last4?: string | null
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          brand?: string | null
          closing_day?: number | null
          color?: string | null
          created_at?: string
          credit_limit?: number | null
          due_day?: number | null
          id?: string
          is_archived?: boolean
          last4?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          parent_id: string | null
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          kind: Database["public"]["Enums"]["category_kind"]
          name: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["category_kind"]
          name?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          color: string | null
          created_at: string
          date: string
          end_time: string | null
          id: string
          is_completed: boolean
          location: string | null
          notes: string | null
          time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          date: string
          end_time?: string | null
          id?: string
          is_completed?: boolean
          location?: string | null
          notes?: string | null
          time?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          is_completed?: boolean
          location?: string | null
          notes?: string | null
          time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          color: string | null
          created_at: string
          current_amount: number
          due_date: string | null
          id: string
          is_archived: boolean
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          current_amount?: number
          due_date?: string | null
          id?: string
          is_archived?: boolean
          name: string
          target_amount: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          current_amount?: number
          due_date?: string | null
          id?: string
          is_archived?: boolean
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_payments: {
        Row: {
          amount: number
          card_id: string
          created_at: string
          id: string
          month_ref: string
          notes: string | null
          paid_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          created_at?: string
          id?: string
          month_ref: string
          notes?: string | null
          paid_at: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          card_id?: string
          created_at?: string
          id?: string
          month_ref?: string
          notes?: string | null
          paid_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency: string
          id: string
          locale: string
          name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          id: string
          locale?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          locale?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          due_time: string | null
          id: string
          is_completed: boolean
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_completed?: boolean
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string
          currency: string
          date: string
          description: string | null
          id: string
          installment_group: string | null
          installment_no: number | null
          installment_total: number | null
          is_recurring: boolean
          month_ref: string | null
          notes: string | null
          recurrence: string | null
          status: Database["public"]["Enums"]["txn_status"]
          transfer_account_id: string | null
          type: Database["public"]["Enums"]["entry_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          currency?: string
          date: string
          description?: string | null
          id?: string
          installment_group?: string | null
          installment_no?: number | null
          installment_total?: number | null
          is_recurring?: boolean
          month_ref?: string | null
          notes?: string | null
          recurrence?: string | null
          status?: Database["public"]["Enums"]["txn_status"]
          transfer_account_id?: string | null
          type: Database["public"]["Enums"]["entry_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          currency?: string
          date?: string
          description?: string | null
          id?: string
          installment_group?: string | null
          installment_no?: number | null
          installment_total?: number | null
          is_recurring?: boolean
          month_ref?: string | null
          notes?: string | null
          recurrence?: string | null
          status?: Database["public"]["Enums"]["txn_status"]
          transfer_account_id?: string | null
          type?: Database["public"]["Enums"]["entry_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transfer_account_id_fkey"
            columns: ["transfer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type:
        | "checking"
        | "savings"
        | "wallet"
        | "cash"
        | "investment"
        | "other"
      category_kind: "income" | "expense"
      entry_type: "income" | "expense" | "transfer"
      task_priority: "low" | "medium" | "high"
      txn_status: "pending" | "cleared"
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
    Enums: {
      account_type: [
        "checking",
        "savings",
        "wallet",
        "cash",
        "investment",
        "other",
      ],
      category_kind: ["income", "expense"],
      entry_type: ["income", "expense", "transfer"],
      task_priority: ["low", "medium", "high"],
      txn_status: ["pending", "cleared"],
    },
  },
} as const
