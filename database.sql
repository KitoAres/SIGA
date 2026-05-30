-- ============================================================
--  SIGA — Sistema Integral de Gestión de Amor
--  Schema completo en PostgreSQL (compatible con Supabase)
--  Ejecutar en Supabase: SQL Editor → New Query → Run
-- ============================================================

-- ── USUARIOS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id           SERIAL PRIMARY KEY,
  usuario      VARCHAR(100) NOT NULL UNIQUE,
  contrasena   VARCHAR(255) NOT NULL,
  nombre       VARCHAR(150) NOT NULL,
  rol          VARCHAR(20)  NOT NULL DEFAULT 'admin',
  display_name VARCHAR(150),
  color_perfil VARCHAR(20)  DEFAULT '#22d3ee'
);

INSERT INTO usuarios (usuario, contrasena, nombre, rol) VALUES
  ('miamor', '123', 'Admin',   'admin'),
  ('yo',     '123', 'Jhoel',   'yo'),
  ('ella',   '123', 'Francin', 'ella')
ON CONFLICT (usuario) DO NOTHING;

-- ── CONFIG AMOR ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS config_amor (
  id           SERIAL PRIMARY KEY,
  fecha_inicio DATE NOT NULL
);

INSERT INTO config_amor (fecha_inicio)
SELECT '2024-04-14' WHERE NOT EXISTS (SELECT 1 FROM config_amor);

-- ── RECUERDOS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recuerdos (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha       DATE
);

-- ── CITAS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(200) NOT NULL,
  lugar       VARCHAR(200),
  descripcion TEXT,
  fecha       DATE,
  estado      VARCHAR(20) DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente', 'cumplida', 'cancelada'))
);

-- ── PLAYLIST ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist (
  id      SERIAL PRIMARY KEY,
  titulo  VARCHAR(200) NOT NULL,
  artista VARCHAR(200),
  enlace  VARCHAR(500),
  frase   TEXT
);

-- ── RAZONES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS razones (
  id    SERIAL PRIMARY KEY,
  texto TEXT NOT NULL
);

-- ── PROMESAS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promesas (
  id    SERIAL PRIMARY KEY,
  texto TEXT NOT NULL
);

-- ── CARTA ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carta (
  id        SERIAL PRIMARY KEY,
  contenido TEXT
);

-- ── NUESTRO TIEMPO ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tiempo_disponibilidad (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  mensaje     VARCHAR(300),
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

-- ── MODO CALMA ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modo_calma (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  mensaje    TEXT,
  activo     BOOLEAN DEFAULT TRUE,
  creado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PUNTOS DE CONEXIÓN ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS puntos_conexion (
  id            SERIAL PRIMARY KEY,
  usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  fuente        VARCHAR(50),
  accion        VARCHAR(100),
  referencia_id INTEGER,
  descripcion   TEXT,
  puntos        INTEGER DEFAULT 0,
  fecha         DATE DEFAULT CURRENT_DATE,
  creado_en     TIMESTAMPTZ DEFAULT NOW()
);

-- ── EVENTOS / MISIONES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo        VARCHAR(50)  DEFAULT 'pregunta',
  nivel       VARCHAR(20)  DEFAULT 'facil',
  modo        VARCHAR(20)  DEFAULT 'simple',
  activo      BOOLEAN      DEFAULT TRUE,
  creado_en   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos_completados (
  id            SERIAL PRIMARY KEY,
  evento_id     INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
  usuario_id    INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  notas         TEXT,
  completado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ── CAJITA ESPECIAL ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cajita (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(200) NOT NULL,
  descripcion TEXT,
  enlace      VARCHAR(500),
  tipo        VARCHAR(50)  DEFAULT 'general',
  creado_en   TIMESTAMPTZ  DEFAULT NOW()
);

-- ── MI ESPACIO ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS espacio_registros (
  id          SERIAL PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  herramienta VARCHAR(50)  NOT NULL,
  estado      VARCHAR(50),
  mensaje     TEXT,
  compartido  BOOLEAN      DEFAULT FALSE,
  creado_en   TIMESTAMPTZ  DEFAULT NOW()
);

-- ── EMAIL NOTIFICACIONES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_notificaciones (
  id         SERIAL PRIMARY KEY,
  tipo       VARCHAR(50),
  clave      VARCHAR(200) UNIQUE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  enviado_a  VARCHAR(200),
  asunto     TEXT,
  creado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACCESOS AL SISTEMA ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accesos_sistema (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  usuario        VARCHAR(100),
  nombre_visible VARCHAR(150),
  rol            VARCHAR(20),
  ip             VARCHAR(100),
  user_agent     TEXT,
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);
