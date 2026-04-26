-- ============================================================
-- Migration 008: Habilitar Realtime na tabela activities
-- Necessário para supabase.channel() receber INSERT e DELETE
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- REPLICA IDENTITY FULL permite que payload.old contenha todos os
-- campos no evento DELETE (necessário para identificar a linha removida)
ALTER TABLE public.activities REPLICA IDENTITY FULL;
