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
      administrador: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      cidade: {
        Row: {
          criado_em: string | null
          estado: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string | null
          estado: string
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string | null
          estado?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      guia_turistico: {
        Row: {
          contratado_em: string | null
          criado_em: string | null
          email: string
          id: string
          nome: string
        }
        Insert: {
          contratado_em?: string | null
          criado_em?: string | null
          email: string
          id?: string
          nome: string
        }
        Update: {
          contratado_em?: string | null
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      participante: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string
          pago: boolean | null
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          nome: string
          pago?: boolean | null
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          pago?: boolean | null
        }
        Relationships: []
      }
      ponto_turistico: {
        Row: {
          cidade_id: string | null
          criado_em: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          cidade_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          cidade_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "ponto_turistico_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidade"
            referencedColumns: ["id"]
          },
        ]
      }
      roteiro: {
        Row: {
          ordem: number
          ponto_turistico_id: string
          viagem_id: string
        }
        Insert: {
          ordem: number
          ponto_turistico_id: string
          viagem_id: string
        }
        Update: {
          ordem?: number
          ponto_turistico_id?: string
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roteiro_ponto_turistico_id_fkey"
            columns: ["ponto_turistico_id"]
            isOneToOne: false
            referencedRelation: "ponto_turistico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roteiro_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagem"
            referencedColumns: ["id"]
          },
        ]
      }
      viagem: {
        Row: {
          criado_em: string | null
          data_fim: string
          data_inicio: string
          guia_turistico_id: string | null
          id: string
          participantes_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_fim: string
          data_inicio: string
          guia_turistico_id?: string | null
          id?: string
          participantes_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_fim?: string
          data_inicio?: string
          guia_turistico_id?: string | null
          id?: string
          participantes_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viagem_guia_turistico_id_fkey"
            columns: ["guia_turistico_id"]
            isOneToOne: false
            referencedRelation: "guia_turistico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagem_participantes_id_fkey"
            columns: ["participantes_id"]
            isOneToOne: false
            referencedRelation: "participante"
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
