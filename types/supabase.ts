// Auto-generated shape para supabase-js v2 — formato com Relationships (obrigatório >= 2.100)
// Atualizar ao adicionar/modificar tabelas nas migrations.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'free' | 'pro'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'pro'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'admin' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          role: string | null
          status: 'ativo' | 'inativo' | 'perdido'
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          role?: string | null
          status?: 'ativo' | 'inativo' | 'perdido'
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          role?: string | null
          status?: 'ativo' | 'inativo' | 'perdido'
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          id: string
          workspace_id: string
          title: string
          lead_id: string | null
          stage: 'novo_lead' | 'contato_realizado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido'
          value: number
          owner_id: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          lead_id?: string | null
          stage?: 'novo_lead' | 'contato_realizado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido'
          value?: number
          owner_id: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          lead_id?: string | null
          stage?: 'novo_lead' | 'contato_realizado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido'
          value?: number
          owner_id?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          workspace_id: string
          lead_id: string
          type: 'call' | 'email' | 'meeting' | 'note'
          description: string
          author_id: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          lead_id: string
          type: 'call' | 'email' | 'meeting' | 'note'
          description: string
          author_id: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          lead_id?: string
          type?: 'call' | 'email' | 'meeting' | 'note'
          description?: string
          author_id?: string
          created_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          id: string
          workspace_id: string
          email: string
          token: string
          role: 'admin' | 'member'
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          token?: string
          role?: 'admin' | 'member'
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          token?: string
          role?: 'admin' | 'member'
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_user_workspace_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      accept_invitation: {
        Args: { p_token: string }
        Returns: Json
      }
    }
    Enums: Record<string, never>
  }
}
