-- ============================================================
--  SIGA — El Universo del Vínculo
--  Tablas opcionales de persistencia para el universo.
--
--  IMPORTANTE: El universo funciona SIN estas tablas,
--  leyendo datos de las tablas ya existentes.
--  Estas tablas solo son necesarias si quieres guardar
--  descubrimientos manuales o estado personalizado.
--
--  Ejecutar en Supabase: SQL Editor → New Query → Run
-- ============================================================

-- ── DESCUBRIMIENTOS DEL UNIVERSO ──────────────────────────
-- Guarda cuando los usuarios "descubren" o marcan algo en el universo.
CREATE TABLE IF NOT EXISTS universo_descubrimientos (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nodo_id       VARCHAR(50)  NOT NULL,
  tipo          VARCHAR(50)  DEFAULT 'explorado',
  nota          TEXT,
  creado_en     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── EVENTOS ESPECIALES DEL UNIVERSO ───────────────────────
-- Para eventos personalizados que no son procedurales.
-- El backend ya genera eventos procedurales automáticamente.
CREATE TABLE IF NOT EXISTS universo_eventos_custom (
  id            SERIAL PRIMARY KEY,
  tipo          VARCHAR(50)  NOT NULL,
  titulo        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  icono         VARCHAR(10)  DEFAULT '✨',
  activo        BOOLEAN      DEFAULT TRUE,
  fecha_inicio  TIMESTAMPTZ  DEFAULT NOW(),
  fecha_fin     TIMESTAMPTZ,
  creado_en     TIMESTAMPTZ  DEFAULT NOW()
);

-- ── ESTADO PERSISTENTE DEL UNIVERSO ───────────────────────
-- Guarda preferencias visuales o última visita.
-- No obligatorio para el funcionamiento básico.
CREATE TABLE IF NOT EXISTS universo_estado (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
  ultima_visita TIMESTAMPTZ  DEFAULT NOW(),
  mensajes_sigy INTEGER      DEFAULT 0,
  preferencias  JSONB        DEFAULT '{}'
);

-- ── ÍNDICES OPCIONALES ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_universo_desc_usuario ON universo_descubrimientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_universo_desc_nodo    ON universo_descubrimientos(nodo_id);
CREATE INDEX IF NOT EXISTS idx_universo_estado_user  ON universo_estado(usuario_id);

-- ── NOTA FINAL ─────────────────────────────────────────────
-- Las tablas principales que alimentan el universo
-- (recuerdos, playlist, carta, razones, promesas, etc.)
-- ya existen en database.sql y NO se modifican aquí.
