-- ============================================================
-- SIGA v2.1 — Mi espacio
-- Herramientas personales sin diario íntimo.
-- Guarda solo señales/frases cortas elegidas por el usuario.
-- ============================================================

CREATE TABLE IF NOT EXISTS espacio_personal_registros (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  herramienta VARCHAR(50) NOT NULL,
  estado VARCHAR(80),
  mensaje TEXT NOT NULL,
  compartido BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_espacio_personal_usuario_fecha
ON espacio_personal_registros(usuario_id, creado_en DESC);
