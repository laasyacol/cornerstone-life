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
      accounting_accounts: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      accounting_categories: {
        Row: {
          created_at: string
          name: string
        }
        Insert: {
          created_at?: string
          name: string
        }
        Update: {
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      accounting_expenses: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          month_id: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date: string
          id?: string
          month_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          month_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_expenses_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "accounting_categories"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "accounting_expenses_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "monthly_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      accounting_incomes: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          description: string
          id: string
          income_date: string
          month_id: string | null
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          description: string
          id?: string
          income_date: string
          month_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          income_date?: string
          month_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_incomes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_incomes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounting_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounting_incomes_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "monthly_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      borrowers: {
        Row: {
          created_at: string
          display_id: number
          id: string
          name: string
          notes: string | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_id: number
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_id?: number
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cash_log: {
        Row: {
          amount: number
          cash_date: string
          category: string
          created_at: string
          description: string
          id: string
          purpose: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          cash_date: string
          category: string
          created_at?: string
          description: string
          id?: string
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          cash_date?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          purpose?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_log_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "accounting_categories"
            referencedColumns: ["name"]
          },
        ]
      }
      loans_disbursed: {
        Row: {
          amount: number
          borrower_id: string | null
          category: string
          created_at: string
          description: string
          disbursement_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id?: string | null
          category: string
          created_at?: string
          description: string
          disbursement_date: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string | null
          category?: string
          created_at?: string
          description?: string
          disbursement_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_disbursed_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrower_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_disbursed_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_summary: {
        Row: {
          created_at: string
          id: string
          income: number
          month: string
          notes: string | null
          saved: number | null
          savings_goal: number | null
          savings_percent: number | null
          spent: number
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          income?: number
          month: string
          notes?: string | null
          saved?: number | null
          savings_goal?: number | null
          savings_percent?: number | null
          spent?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          income?: number
          month?: string
          notes?: string | null
          saved?: number | null
          savings_goal?: number | null
          savings_percent?: number | null
          spent?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      repayments_received: {
        Row: {
          amount: number
          borrower_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          repayment_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          borrower_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          repayment_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          borrower_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          repayment_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repayments_received_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrower_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "repayments_received_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "borrowers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      account_balances: {
        Row: {
          current_balance: number | null
          id: string | null
          name: string | null
          total_expense: number | null
          total_income: number | null
        }
        Relationships: []
      }
      borrower_balances: {
        Row: {
          display_id: number | null
          id: string | null
          name: string | null
          outstanding: number | null
          phone_number: string | null
          total_lent: number | null
          total_repaid: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
