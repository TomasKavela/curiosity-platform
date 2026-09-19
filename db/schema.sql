-- curiosity-platform — D1 schema
-- Ver ARCHITECTURE.md e DECISIONS.md para o raciocínio por trás destas escolhas.

PRAGMA foreign_keys = ON;

-- ── Identidade ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,              -- uuid
  device_token  TEXT UNIQUE NOT NULL,           -- sessão anónima
  email         TEXT UNIQUE,                    -- NULL até upgrade opcional
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Perfil ──────────────────────────────────────────────────
-- Perfil confirmado (o que o utilizador viu e aceitou) vs. candidato
-- (sinais extraídos automaticamente, pendentes de confirmação).
CREATE TABLE IF NOT EXISTS profiles (
  user_id           TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name      TEXT,
  user_type         TEXT,                       -- ex: 'student' | 'professional' | 'curious'
  field_of_study    TEXT,
  confirmed_json     TEXT NOT NULL DEFAULT '{}', -- { interests: [], hobbies: [], technicalInterests: [] }
  candidate_json     TEXT NOT NULL DEFAULT '{}', -- mesma forma, ainda não confirmado pelo utilizador
  onboarding_step    INTEGER NOT NULL DEFAULT 0,
  onboarding_done    INTEGER NOT NULL DEFAULT 0, -- boolean
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ── Exploração ──────────────────────────────────────────────
-- 'type' distingue exploração normal de "projeto/experimento" (Secção 7 da Fase 2:
-- fundido em vez de entidade própria). 'origin' distingue exploração guiada de
-- "Tive uma ideia" espontânea.
CREATE TABLE IF NOT EXISTS explorations (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_exploration_id TEXT REFERENCES explorations(id) ON DELETE SET NULL,
  title               TEXT,                       -- gerado a partir da 1ª pergunta/ideia
  type                TEXT NOT NULL DEFAULT 'exploration', -- 'exploration' | 'project'
  origin              TEXT NOT NULL DEFAULT 'guided',      -- 'guided' | 'spontaneous'
  status              TEXT NOT NULL DEFAULT 'active',       -- 'active' | 'paused' | 'archived'
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_explorations_user ON explorations(user_id, status);

CREATE TABLE IF NOT EXISTS exploration_messages (
  id              TEXT PRIMARY KEY,
  exploration_id  TEXT NOT NULL REFERENCES explorations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,                  -- 'question' | 'answer' | 'idea' | 'system_note'
  strategy        TEXT,                            -- estratégia usada pelo Curiosity Engine (só em 'question')
  content         TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_exploration ON exploration_messages(exploration_id, created_at);

-- ── Memória de médio/longo prazo ───────────────────────────
-- Resumos estruturados por exploração fechada/pausada + tags para recuperação
-- por tema. Ver ARCHITECTURE.md secção "Estratégia de Memória" — Vectorize
-- fica fora do MVP por desenho, não por esquecimento.
CREATE TABLE IF NOT EXISTS memories (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exploration_id  TEXT REFERENCES explorations(id) ON DELETE SET NULL,
  summary         TEXT NOT NULL,
  tags_json       TEXT NOT NULL DEFAULT '[]',      -- ["optimização", "sensores", ...]
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id, created_at);

-- ── Notificações ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,                       -- pergunta personalizada, nunca "estuda agora"
  related_exploration_id TEXT REFERENCES explorations(id) ON DELETE SET NULL,
  read        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
