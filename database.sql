CREATE DATABASE IF NOT EXISTS siga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE siga;

CREATE TABLE IF NOT EXISTS usuarios_amor (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(60) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(60) DEFAULT 'Dueña de mi corazón',
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_usuario)
);

CREATE TABLE IF NOT EXISTS recuerdos (
  id_recuerdo INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(120) NOT NULL,
  fecha DATE NULL,
  lugar VARCHAR(150) NULL,
  descripcion TEXT NOT NULL,
  sentimiento VARCHAR(80) NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_recuerdo)
);

CREATE TABLE IF NOT EXISTS citas_romanticas (
  id_cita INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(120) NOT NULL,
  lugar VARCHAR(150) NULL,
  fecha DATETIME NULL,
  descripcion TEXT NULL,
  estado ENUM('pendiente','en_progreso','cumplida') DEFAULT 'pendiente',
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_cita)
);

CREATE TABLE IF NOT EXISTS playlist (
  id_cancion INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(120) NOT NULL,
  artista VARCHAR(120) NULL,
  enlace TEXT NULL,
  motivo TEXT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_cancion)
);

CREATE TABLE IF NOT EXISTS razones (
  id_razon INT NOT NULL AUTO_INCREMENT,
  texto TEXT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_razon)
);

CREATE TABLE IF NOT EXISTS promesas (
  id_promesa INT NOT NULL AUTO_INCREMENT,
  texto TEXT NOT NULL,
  estado ENUM('vigente','cumplida') DEFAULT 'vigente',
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_promesa)
);

CREATE TABLE IF NOT EXISTS cartas (
  id_carta INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(120) NOT NULL,
  contenido TEXT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_carta)
);

-- Contraseña: 123
INSERT INTO usuarios_amor (nombre, usuario, contrasena_hash, rol, activo)
VALUES ('Mi persona favorita', 'miamor', '$2b$10$kNCFqP67GoLuqxb5MkOjPe.zEYqYmyq1RjhrcUQk3BIxUh2A6uC1W', 'Dueña de mi corazón', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), contrasena_hash = VALUES(contrasena_hash), activo = 1;

INSERT INTO recuerdos (titulo, fecha, lugar, descripcion, sentimiento, activo) VALUES
('El día que todo empezó', CURDATE(), 'Nuestro lugar especial', 'Desde ese día algo cambió. No fue ruido, fue calma. Fue sentir que estar contigo hacía que el mundo pesara menos.', 'ternura', 1),
('Una caminata que no olvido', DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'La calle, el café, nosotros', 'Caminamos como si el tiempo no estuviera apurado. Y yo solo pensaba que quería más días así contigo.', 'calma', 1),
('Cuando me miraste bonito', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 'Ese momento pequeño', 'A veces un momento dura segundos, pero se queda viviendo mucho tiempo en la memoria.', 'mariposas', 1);

INSERT INTO citas_romanticas (titulo, lugar, fecha, descripcion, estado, activo) VALUES
('Café y caminata', 'Donde elijamos juntos', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Una cita simple, pero de esas que se sienten bonitas porque estás tú.', 'pendiente', 1),
('Noche de película', 'Con mantita y algo rico', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Elegimos una película y fingimos verla, aunque probablemente terminemos hablando más.', 'pendiente', 1),
('Nuestra aventura pendiente', 'Sorpresa', DATE_ADD(NOW(), INTERVAL 15 DAY), 'Una salida para recordarte que quiero seguir haciendo planes contigo.', 'pendiente', 1);

INSERT INTO playlist (titulo, artista, enlace, motivo, activo) VALUES
('Canción que me recuerda a ti', 'Artista especial', '', 'Porque tiene algo de ti: suave, bonita y difícil de sacar de la cabeza.', 1),
('La de caminar contigo', 'Playlist nuestra', '', 'Me recuerda a esas veces en que caminar contigo se siente como estar llegando a casa.', 1),
('La que pondría si te escribiera una carta', 'Canción pendiente', '', 'Porque dice cosas que a veces yo no sé decir bien.', 1);

INSERT INTO razones (texto, activo) VALUES
('Porque contigo no necesito fingir tanto.', 1),
('Porque incluso tus silencios me importan.', 1),
('Porque cuando sonríes, algo en mí descansa.', 1),
('Porque quiero aprender a quererte mejor, no solo quererte mucho.', 1),
('Porque en tus ojos proyecto un futuro bonito.', 1),
('Porque no eres perfecta, pero eres real, y eso me gusta más.', 1);

INSERT INTO promesas (texto, estado, activo) VALUES
('Prometo no rendirme ante los días difíciles sin antes intentar entenderte.', 'vigente', 1),
('Prometo cuidar lo que estamos construyendo, aunque a veces no sea fácil.', 'vigente', 1),
('Prometo recordarte con acciones que eres importante para mí.', 'vigente', 1);

INSERT INTO cartas (titulo, contenido, activo) VALUES
('Para ti', 'No hice esto para impresionar a nadie. Lo hice porque hay cosas que siento y a veces no sé decir sin ponerme nervioso. Así que lo convertí en un pequeño sistema, como una forma rara, tierna y muy mía de decirte que te quiero. No soy perfecto, pero contigo quiero ser mejor. Y si pudiera elegir comenzar de nuevo, elegiría el camino que me lleve a ti antes.', 1);
