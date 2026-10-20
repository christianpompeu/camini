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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      app_permissions: {
        Row: {
          allowed_routes: string[] | null
          created_at: string
          email: string
          id: string
          is_super_admin: boolean | null
          updated_at: string
        }
        Insert: {
          allowed_routes?: string[] | null
          created_at?: string
          email: string
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          allowed_routes?: string[] | null
          created_at?: string
          email?: string
          id?: string
          is_super_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      ctc_aulas: {
        Row: {
          created_at: string
          data_hora: string
          data_hora_fim: string | null
          disciplina_id: string | null
          duracao_minutos: number
          id: string
          modalidade: string | null
          motivo: string | null
          observacoes: string | null
          professor_id: string
          situacao: string
          tipo_ocorrencia: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          data_hora_fim?: string | null
          disciplina_id?: string | null
          duracao_minutos?: number
          id?: string
          modalidade?: string | null
          motivo?: string | null
          observacoes?: string | null
          professor_id?: string
          situacao?: string
          tipo_ocorrencia?: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          data_hora_fim?: string | null
          disciplina_id?: string | null
          duracao_minutos?: number
          id?: string
          modalidade?: string | null
          motivo?: string | null
          observacoes?: string | null
          professor_id?: string
          situacao?: string
          tipo_ocorrencia?: string
        }
        Relationships: [
          {
            foreignKeyName: "ctc_aulas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "ctc_disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ctc_aulas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "ctc_professores"
            referencedColumns: ["id"]
          },
        ]
      }
      ctc_disciplinas: {
        Row: {
          carga_horaria: number | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          carga_horaria?: number | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          carga_horaria?: number | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      ctc_professores: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      observatorio_edicoes: {
        Row: {
          aprovada_em: string | null
          canal: string
          criada_em: string
          id: string
          identificador: string
          notion_page_id: string | null
          notion_url: string | null
          publicada_em: string | null
          resumo: string
          rodada_id: string | null
          snapshot: Json | null
          status: string
          titulo: string
          versao: number
        }
        Insert: {
          aprovada_em?: string | null
          canal: string
          criada_em?: string
          id?: string
          identificador: string
          notion_page_id?: string | null
          notion_url?: string | null
          publicada_em?: string | null
          resumo: string
          rodada_id?: string | null
          snapshot?: Json | null
          status?: string
          titulo: string
          versao?: number
        }
        Update: {
          aprovada_em?: string | null
          canal?: string
          criada_em?: string
          id?: string
          identificador?: string
          notion_page_id?: string | null
          notion_url?: string | null
          publicada_em?: string | null
          resumo?: string
          rodada_id?: string | null
          snapshot?: Json | null
          status?: string
          titulo?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_edicoes_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "observatorio_rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      observatorio_eventos: {
        Row: {
          categoria: string
          chave: string
          dados: Json
          data_evento: string | null
          data_evento_precisao: string
          descricao: string
          evento_canonico_id: string | null
          id: string
          notion_page_id: string | null
          status_sanitizacao: string
          status_verificacao: string
          titulo: string
          visto_primeiro_em: string
          visto_ultimo_em: string
        }
        Insert: {
          categoria: string
          chave: string
          dados?: Json
          data_evento?: string | null
          data_evento_precisao?: string
          descricao: string
          evento_canonico_id?: string | null
          id?: string
          notion_page_id?: string | null
          status_sanitizacao?: string
          status_verificacao?: string
          titulo: string
          visto_primeiro_em?: string
          visto_ultimo_em?: string
        }
        Update: {
          categoria?: string
          chave?: string
          dados?: Json
          data_evento?: string | null
          data_evento_precisao?: string
          descricao?: string
          evento_canonico_id?: string | null
          id?: string
          notion_page_id?: string | null
          status_sanitizacao?: string
          status_verificacao?: string
          titulo?: string
          visto_primeiro_em?: string
          visto_ultimo_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_eventos_evento_canonico_id_fkey"
            columns: ["evento_canonico_id"]
            isOneToOne: false
            referencedRelation: "observatorio_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      observatorio_eventos_materias: {
        Row: {
          criado_em: string
          evento_id: string
          materia_id: string
          papel: string
        }
        Insert: {
          criado_em?: string
          evento_id: string
          materia_id: string
          papel?: string
        }
        Update: {
          criado_em?: string
          evento_id?: string
          materia_id?: string
          papel?: string
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_eventos_materias_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "observatorio_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observatorio_eventos_materias_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "observatorio_materias"
            referencedColumns: ["id"]
          },
        ]
      }
      observatorio_fontes: {
        Row: {
          criado_em: string
          dominio: string
          id: string
          nome: string
          notas: string | null
          tipo: string
        }
        Insert: {
          criado_em?: string
          dominio: string
          id?: string
          nome: string
          notas?: string | null
          tipo?: string
        }
        Update: {
          criado_em?: string
          dominio?: string
          id?: string
          nome?: string
          notas?: string | null
          tipo?: string
        }
        Relationships: []
      }
      observatorio_materias: {
        Row: {
          coletado_em: string
          fonte_id: string
          formato: string
          id: string
          idioma: string
          metadados: Json
          publicado_em: string | null
          resumo: string
          revisao_por_pares: boolean | null
          rodada_id: string | null
          status_verificacao: string
          titulo: string
          url_canonica: string
        }
        Insert: {
          coletado_em?: string
          fonte_id: string
          formato?: string
          id?: string
          idioma?: string
          metadados?: Json
          publicado_em?: string | null
          resumo: string
          revisao_por_pares?: boolean | null
          rodada_id?: string | null
          status_verificacao?: string
          titulo: string
          url_canonica: string
        }
        Update: {
          coletado_em?: string
          fonte_id?: string
          formato?: string
          id?: string
          idioma?: string
          metadados?: Json
          publicado_em?: string | null
          resumo?: string
          revisao_por_pares?: boolean | null
          rodada_id?: string | null
          status_verificacao?: string
          titulo?: string
          url_canonica?: string
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_materias_fonte_id_fkey"
            columns: ["fonte_id"]
            isOneToOne: false
            referencedRelation: "observatorio_fontes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observatorio_materias_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "observatorio_rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      observatorio_relacoes: {
        Row: {
          confianca: number | null
          criado_em: string
          destino_id: string
          evidencia_status: string
          id: string
          justificativa: string
          notion_page_id: string | null
          origem_id: string
          revisado_em: string | null
          revisao: string
          tipo: string
        }
        Insert: {
          confianca?: number | null
          criado_em?: string
          destino_id: string
          evidencia_status?: string
          id?: string
          justificativa: string
          notion_page_id?: string | null
          origem_id: string
          revisado_em?: string | null
          revisao?: string
          tipo: string
        }
        Update: {
          confianca?: number | null
          criado_em?: string
          destino_id?: string
          evidencia_status?: string
          id?: string
          justificativa?: string
          notion_page_id?: string | null
          origem_id?: string
          revisado_em?: string | null
          revisao?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_relacoes_destino_id_fkey"
            columns: ["destino_id"]
            isOneToOne: false
            referencedRelation: "observatorio_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observatorio_relacoes_origem_id_fkey"
            columns: ["origem_id"]
            isOneToOne: false
            referencedRelation: "observatorio_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      observatorio_relacoes_evidencias: {
        Row: {
          justificativa: string | null
          materia_id: string
          papel: string
          relacao_id: string
        }
        Insert: {
          justificativa?: string | null
          materia_id: string
          papel?: string
          relacao_id: string
        }
        Update: {
          justificativa?: string | null
          materia_id?: string
          papel?: string
          relacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_relacoes_evidencias_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "observatorio_materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observatorio_relacoes_evidencias_relacao_id_fkey"
            columns: ["relacao_id"]
            isOneToOne: false
            referencedRelation: "observatorio_relacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      observatorio_rodadas: {
        Row: {
          canal: string
          concluido_em: string | null
          diagnostico: Json
          id: string
          iniciado_em: string
          janela_fim: string | null
          janela_inicio: string | null
          origem: string
          resumo: string | null
          run_key: string
          status: string
        }
        Insert: {
          canal: string
          concluido_em?: string | null
          diagnostico?: Json
          id?: string
          iniciado_em?: string
          janela_fim?: string | null
          janela_inicio?: string | null
          origem?: string
          resumo?: string | null
          run_key: string
          status?: string
        }
        Update: {
          canal?: string
          concluido_em?: string | null
          diagnostico?: Json
          id?: string
          iniciado_em?: string
          janela_fim?: string | null
          janela_inicio?: string | null
          origem?: string
          resumo?: string | null
          run_key?: string
          status?: string
        }
        Relationships: []
      }
      observatorio_tendencias: {
        Row: {
          atualizado_em: string
          base_amostral: number
          descricao: string
          estado: string
          id: string
          janela_fim: string | null
          janela_inicio: string | null
          metadados: Json
          metodo: string
          notion_page_id: string | null
          score: number | null
          slug: string
          titulo: string
        }
        Insert: {
          atualizado_em?: string
          base_amostral?: number
          descricao: string
          estado?: string
          id?: string
          janela_fim?: string | null
          janela_inicio?: string | null
          metadados?: Json
          metodo: string
          notion_page_id?: string | null
          score?: number | null
          slug: string
          titulo: string
        }
        Update: {
          atualizado_em?: string
          base_amostral?: number
          descricao?: string
          estado?: string
          id?: string
          janela_fim?: string | null
          janela_inicio?: string | null
          metadados?: Json
          metodo?: string
          notion_page_id?: string | null
          score?: number | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      observatorio_tendencias_eventos: {
        Row: {
          evento_id: string
          ligado_em: string
          tendencia_id: string
        }
        Insert: {
          evento_id: string
          ligado_em?: string
          tendencia_id: string
        }
        Update: {
          evento_id?: string
          ligado_em?: string
          tendencia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observatorio_tendencias_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "observatorio_eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observatorio_tendencias_eventos_tendencia_id_fkey"
            columns: ["tendencia_id"]
            isOneToOne: false
            referencedRelation: "observatorio_tendencias"
            referencedColumns: ["id"]
          },
        ]
      }
      public_routes: {
        Row: {
          is_public: boolean
          route_path: string
        }
        Insert: {
          is_public?: boolean
          route_path: string
        }
        Update: {
          is_public?: boolean
          route_path?: string
        }
        Relationships: []
      }
      radar_admin_acoes: {
        Row: {
          acao: string
          created_at: string
          edicao_id: string
          id: string
          motivo: string | null
          processed_at: string | null
          realizado_por: string
          status: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          edicao_id: string
          id?: string
          motivo?: string | null
          processed_at?: string | null
          realizado_por: string
          status?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          edicao_id?: string
          id?: string
          motivo?: string | null
          processed_at?: string | null
          realizado_por?: string
          status?: string | null
        }
        Relationships: []
      }
      radar_assinantes: {
        Row: {
          created_at: string
          email: string
          id: string
          last_sent_at: string | null
          metadata: Json
          nome: string | null
          origem: string
          status: string
          subscribed_at: string
          telefone: string | null
          unsubscribe_token: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_sent_at?: string | null
          metadata?: Json
          nome?: string | null
          origem?: string
          status?: string
          subscribed_at?: string
          telefone?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_sent_at?: string | null
          metadata?: Json
          nome?: string | null
          origem?: string
          status?: string
          subscribed_at?: string
          telefone?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      radar_edicoes: {
        Row: {
          approved_at: string | null
          content_hash: string | null
          created_at: string
          edition_at: string
          hero_image: Json | null
          id: string
          identificador: string
          is_test: boolean
          notion_last_edited_at: string | null
          notion_page_id: string | null
          notion_url: string | null
          numero: number
          period_label: string | null
          published_at: string | null
          reading_minutes: number | null
          resumo: string | null
          slug: string
          snapshot: Json | null
          snapshot_version: number
          status: string
          subtitulo: string | null
          synced_at: string | null
          tags: string[]
          titulo: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          content_hash?: string | null
          created_at?: string
          edition_at: string
          hero_image?: Json | null
          id?: string
          identificador: string
          is_test?: boolean
          notion_last_edited_at?: string | null
          notion_page_id?: string | null
          notion_url?: string | null
          numero: number
          period_label?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          resumo?: string | null
          slug: string
          snapshot?: Json | null
          snapshot_version?: number
          status?: string
          subtitulo?: string | null
          synced_at?: string | null
          tags?: string[]
          titulo: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          content_hash?: string | null
          created_at?: string
          edition_at?: string
          hero_image?: Json | null
          id?: string
          identificador?: string
          is_test?: boolean
          notion_last_edited_at?: string | null
          notion_page_id?: string | null
          notion_url?: string | null
          numero?: number
          period_label?: string | null
          published_at?: string | null
          reading_minutes?: number | null
          resumo?: string | null
          slug?: string
          snapshot?: Json | null
          snapshot_version?: number
          status?: string
          subtitulo?: string | null
          synced_at?: string | null
          tags?: string[]
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      radar_monitoramentos: {
        Row: {
          candidate_edition_id: string | null
          created_at: string
          detalhes: Json
          error_message: string | null
          finished_at: string | null
          id: string
          resumo: string | null
          run_key: string | null
          source: string
          started_at: string
          status: string
        }
        Insert: {
          candidate_edition_id?: string | null
          created_at?: string
          detalhes?: Json
          error_message?: string | null
          finished_at?: string | null
          id?: string
          resumo?: string | null
          run_key?: string | null
          source?: string
          started_at?: string
          status: string
        }
        Update: {
          candidate_edition_id?: string | null
          created_at?: string
          detalhes?: Json
          error_message?: string | null
          finished_at?: string | null
          id?: string
          resumo?: string | null
          run_key?: string | null
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "radar_monitoramentos_candidate_edition_id_fkey"
            columns: ["candidate_edition_id"]
            isOneToOne: false
            referencedRelation: "radar_edicoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_route_access: { Args: { check_route: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
