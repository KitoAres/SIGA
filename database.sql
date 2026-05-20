-- ============================================================
--  SIGA — Sistema Integral de Gestión de Amor
--  Base de datos completa con datos de prueba
-- ============================================================

CREATE DATABASE IF NOT EXISTS siga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siga;

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(100) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  rol VARCHAR(20) DEFAULT 'admin'
);

-- Usuario principal
INSERT INTO usuarios (usuario, contrasena, nombre, rol) VALUES
('miamor', '123', 'Mi persona favorita', 'admin');

-- Usuarios del modulo Nuestro Tiempo (cambia nombres/contrasenas si quieres)
INSERT INTO usuarios (usuario, contrasena, nombre, rol) VALUES
('yo',   '123', 'Jhoel',   'yo'),
('ella', '123', 'Francin', 'ella');

-- Tabla de disponibilidades
CREATE TABLE IF NOT EXISTS tiempo_disponibilidad (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  mensaje     VARCHAR(300) DEFAULT NULL,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Datos de prueba: coincidencia real (08:00 a 10:00)
INSERT INTO tiempo_disponibilidad (usuario_id, fecha, hora_inicio, hora_fin, mensaje)
SELECT id, '2026-05-10', '07:30:00', '11:00:00', 'Manana libre'
FROM usuarios WHERE rol = 'yo' LIMIT 1;

INSERT INTO tiempo_disponibilidad (usuario_id, fecha, hora_inicio, hora_fin, mensaje)
SELECT id, '2026-05-10', '08:00:00', '10:00:00', 'Tengo tiempo en la manana'
FROM usuarios WHERE rol = 'ella' LIMIT 1;

-- Datos de prueba: sin coincidencia
INSERT INTO tiempo_disponibilidad (usuario_id, fecha, hora_inicio, hora_fin, mensaje)
SELECT id, '2026-05-12', '07:30:00', '10:00:00', 'Solo puedo en la manana'
FROM usuarios WHERE rol = 'yo' LIMIT 1;

INSERT INTO tiempo_disponibilidad (usuario_id, fecha, hora_inicio, hora_fin, mensaje)
SELECT id, '2026-05-12', '10:30:00', '12:00:00', 'Libre a partir de las 10:30'
FROM usuarios WHERE rol = 'ella' LIMIT 1;

-- Config amor (fecha de inicio de la relacion)
CREATE TABLE IF NOT EXISTS config_amor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_inicio DATE NOT NULL
);

INSERT INTO config_amor (fecha_inicio) VALUES ('2024-04-14');

-- Recuerdos
CREATE TABLE IF NOT EXISTS recuerdos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha DATE
);

INSERT INTO recuerdos (titulo, descripcion, fecha) VALUES
('La primera vez que te vi', 'Había algo en tus ojos que me hizo pensar que ya te conocía de antes. Como si mi memoria te hubiera inventado mucho antes de que existieras en mi vida.', '2024-04-14'),
('Nuestra primera caminata', 'Caminamos sin rumbo fijo y sin querer llegamos al lugar más bonito: uno al lado del otro. Ese día aprendí que contigo cualquier camino vale la pena.', '2024-04-20'),
('Cuando me hiciste reír hasta llorar', 'No recuerdo ni de qué fue, pero sí recuerdo que en ese momento pensé: quiero que esta persona esté siempre cerca de mí.', '2024-05-03'),
('La tarde que se fue la luz', 'Hablamos en la oscuridad durante horas. Fue la primera vez que sentí que alguien me escuchaba de verdad, sin prisa, sin juzgar.', '2024-06-15'),
('Tu cumpleaños', 'Intenté que ese día fuera especial porque tú lo eres cada día. Espero haberlo logrado aunque sea un poco.', '2024-07-22');

-- Citas
CREATE TABLE IF NOT EXISTS citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  lugar VARCHAR(200),
  descripcion TEXT,
  fecha DATE,
  estado ENUM('pendiente', 'cumplida', 'cancelada') DEFAULT 'pendiente'
);

INSERT INTO citas (titulo, lugar, descripcion, fecha, estado) VALUES
('Picnic bajo las estrellas', 'Parque central', 'Llevar mantas, snacks favoritos y mirar el cielo juntos. Sin celulares, solo nosotros dos.', '2026-06-21', 'pendiente'),
('Tarde de películas', 'En casa', 'Maratón de películas con palomitas y cobijas. Tú eliges todas.', '2026-05-18', 'pendiente'),
('Paseo por la feria', 'Feria de la ciudad', 'Algodón de azúcar, juegos y fotos ridículas en los espejos deformantes.', '2025-12-15', 'cumplida'),
('Cena especial', 'Restaurante favorito', 'Celebrar que existes y que decidiste quedarte en mi vida.', '2026-07-04', 'pendiente'),
('Viaje de fin de semana', 'Lugar sorpresa', 'Un destino secreto que estoy planeando. Solo sé que va a gustarte.', '2026-09-01', 'pendiente');

-- Playlist
CREATE TABLE IF NOT EXISTS playlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  artista VARCHAR(200),
  enlace VARCHAR(500),
  frase TEXT
);

INSERT INTO playlist (titulo, artista, enlace, frase) VALUES
('Perfect', 'Ed Sheeran', 'https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v', 'Darling, just hold my hand. Be my girl, I\'ll be your man.'),
('Die With A Smile', 'Lady Gaga & Bruno Mars', 'https://open.spotify.com/track/2plbrEY59IikOBgBGLjaoe', 'Esta canción suena cada vez que pienso en ti.'),
('Lover', 'Taylor Swift', 'https://open.spotify.com/track/1dGr1c8CrMLDpV6mPbImSI', 'Can I go where you go? Can we always be this close?'),
('Tú', 'Camilo', 'https://open.spotify.com/track/0FkFTb9P09J3bKjAjFzNLC', 'Contigo todo tiene más sentido.'),
('Thinking Out Loud', 'Ed Sheeran', 'https://open.spotify.com/track/34gCuhDGsG4bRPIf9bb02f', 'People fall in love in mysterious ways, maybe just the touch of a hand.');

-- Razones
CREATE TABLE IF NOT EXISTS razones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  texto TEXT NOT NULL
);

INSERT INTO razones (texto) VALUES
('Porque cuando sonríes, el resto del mundo se vuelve un detalle menor.'),
('Porque eres honesta incluso cuando es difícil, y eso vale más que mil palabras bonitas.'),
('Porque me haces sentir que merezco ser querido, y no todo el mundo tiene ese don.'),
('Porque tu forma de preocuparte por los demás me recuerda que la bondad aún existe.'),
('Porque eres más fuerte de lo que crees, y yo lo veo aunque tú no siempre puedas.'),
('Porque me haces querer ser mejor persona, no por obligación sino porque tú lo mereces.'),
('Porque tu risa es lo más genuino que he escuchado en mucho tiempo.'),
('Porque elegirte es fácil, incluso en los días difíciles.'),
('Porque cuando estás cerca, todo tiene más color.'),
('Porque eres tú, y con eso es más que suficiente.');

-- Promesas
CREATE TABLE IF NOT EXISTS promesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  texto TEXT NOT NULL
);

INSERT INTO promesas (texto) VALUES
('Prometo escucharte aunque no tenga respuestas, porque a veces solo necesitas que alguien esté ahí.'),
('Prometo recordarte que eres suficiente en los días en que lo olvides.'),
('Prometo elegirte, incluso cuando sea complicado, porque lo que tenemos vale el esfuerzo.'),
('Prometo hacer reír cuando el mundo se sienta demasiado pesado.'),
('Prometo ser honesto contigo, incluso cuando la verdad sea incómoda.'),
('Prometo no darte por sentada, porque sé lo mucho que vales.'),
('Prometo seguir aprendiendo cómo quererte mejor cada día.'),
('Prometo guardarte los secretos y proteger lo que me confíes.');

-- Carta
CREATE TABLE IF NOT EXISTS carta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  contenido LONGTEXT
);

INSERT INTO carta (contenido) VALUES (
'Para ti, que de alguna manera inexplicable llegaste a quedarte.

No sé en qué momento exacto pasó. Quizás fue en una conversación que empezó sin importancia y terminó pareciéndome la más importante que había tenido. Quizás fue cuando me di cuenta de que pensaba en ti incluso cuando no tenía una razón concreta para hacerlo. Quizás fue antes, mucho antes de que yo lo notara.

Lo que sí sé es que hay personas que pasan por tu vida como el viento: las sientes, te mueven un poco, y desaparecen. Y hay otras que se quedan. No de manera ruidosa ni dramática, sino de esa forma silenciosa y constante que hace que un día te despiertes y ya no recuerdes cómo era antes de conocerlas.

Tú eres de las segundas.

Me gusta quién soy cuando estás cerca. Me gusta que puedo hablar sin elegir tanto las palabras. Me gusta que el silencio contigo no incomoda. Me gusta que te importa el mundo, que tienes convicciones, que cuando algo te parece injusto lo dices aunque cueste. Me gusta tu risa, que cuando aparece es completamente tuya, sin performance.

No te escribo esto para impresionarte. Te lo escribo porque creo que las personas merecen saber lo que valen para quienes las quieren. Y tú vales mucho para mí.

No sé qué viene después. Pero sí sé que mientras estés, voy a elegirte. No desde la obligación ni desde el miedo, sino desde algo que se parece mucho a la certeza.

Gracias por quedarte.

Con todo,
Yo.'
);


-- ============================================================
--  MÓDULO: Nuestro Tiempo
--  Agregar columna rol a usuarios + nuevos usuarios + tabla
-- ============================================================

-- Agregar columna rol si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol ENUM('admin', 'yo', 'ella') NOT NULL DEFAULT 'admin';

-- Actualizar usuario principal
UPDATE usuarios SET rol = 'admin' WHERE usuario = 'miamor';

-- Usuarios del módulo Nuestro Tiempo
INSERT IGNORE INTO usuarios (usuario, contrasena, nombre, rol) VALUES
('yo',   '123', 'Yo',   'yo'),
('ella', '123', 'Ella', 'ella');

-- Tabla de disponibilidades
CREATE TABLE IF NOT EXISTS tiempo_disponibilidad (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT NOT NULL,
  fecha       DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin    TIME NOT NULL,
  mensaje     VARCHAR(300) DEFAULT NULL,
  creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
