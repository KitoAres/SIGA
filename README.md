# 💜 SIGA — Sistema Integral de Gestión de Amor

Una página romántica interactiva con diseño de dashboard moderno. Construida con Node.js + Express + MySQL.

---

## Credenciales de acceso

```
Usuario:    miamor
Contraseña: 123
```

---

## Despliegue en Railway (paso a paso)

### 1. Crear proyecto en Railway

- Entra a [railway.app](https://railway.app) y crea una cuenta o inicia sesión.
- Crea un nuevo proyecto vacío.

### 2. Agregar MySQL

- Dentro del proyecto, haz clic en **"+ New"** → **"Database"** → **"MySQL"**.
- Railway creará la base de datos automáticamente.
- Haz clic en el servicio MySQL → pestaña **"Variables"** → copia los datos de conexión.

### 3. Ejecutar el SQL inicial

- En Railway, ve al servicio MySQL → pestaña **"Data"** → **"Query"**.
- Pega el contenido completo del archivo `database.sql` y ejecútalo.
- Esto creará todas las tablas y cargará los datos de prueba.

> **Nota para Railway:** Railway usa `railway` como nombre de base de datos por defecto. Si es así, cambia `USE siga;` por `USE railway;` en el SQL, o ajusta la variable `DB_NAME` a `railway`.

### 4. Subir el código a GitHub

- Sube el proyecto a un repositorio de GitHub (puede ser privado).
- La estructura debe mantener la carpeta `SIGA/` como raíz.

### 5. Crear el servicio web en Railway

- En tu proyecto Railway, haz clic en **"+ New"** → **"GitHub Repo"**.
- Selecciona tu repositorio.

### 6. Configurar el servicio web

En el servicio web, ve a **"Settings"** y configura:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `/backend` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### 7. Configurar variables de entorno

En el servicio web → pestaña **"Variables"**, agrega:

| Variable | Valor |
|----------|-------|
| `DB_HOST` | `mysql.railway.internal` (o el host interno de Railway) |
| `DB_USER` | `root` |
| `DB_PASSWORD` | (la contraseña que Railway te dio para MySQL) |
| `DB_NAME` | `railway` (o `siga` si creaste la DB manualmente) |
| `DB_PORT` | `3306` |

> **Tip:** Railway también ofrece un botón "Add from another service" que auto-completa las variables del MySQL. Úsalo si está disponible.

### 8. Desplegar

- Railway detectará los cambios automáticamente y desplegará.
- Espera a que el build termine (puedes ver los logs en tiempo real).

### 9. Generar dominio público

- En el servicio web → **"Settings"** → **"Networking"** → **"Generate Domain"**.
- Railway te dará una URL tipo `siga-production-xxxx.up.railway.app`.

### 10. Abrir y usar

- Entra a la URL generada.
- Inicia sesión con `miamor` / `123`.
- ¡Listo! 💜

---

## Estructura del proyecto

```
SIGA/
├── backend/
│   ├── server.js           ← Punto de entrada, sirve desde /public
│   ├── package.json
│   ├── config/
│   │   └── db.js           ← Conexión MySQL con variables de entorno
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── recuerdos.js
│   │   ├── citas.js
│   │   ├── playlist.js
│   │   ├── razones.js
│   │   ├── promesas.js
│   │   └── cartas.js
│   └── public/             ← Frontend completo
│       ├── index.html
│       ├── css/style.css
│       └── js/app.js
├── database.sql            ← Ejecutar en MySQL antes del primer deploy
└── README.md
```

---

## Desarrollo local

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Crear archivo .env en /backend
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=siga
DB_PORT=3306

# 3. Ejecutar el SQL en tu MySQL local
mysql -u root -p < ../database.sql

# 4. Iniciar el servidor
node server.js
# → SIGA corriendo en puerto 3000

# 5. Abrir en navegador
http://localhost:3000
```

---

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/resumen` | Stats del dashboard |
| GET/POST | `/api/recuerdos` | Listar / Crear |
| PUT/DELETE | `/api/recuerdos/:id` | Editar / Eliminar |
| GET/POST | `/api/citas` | Listar / Crear |
| PUT/DELETE | `/api/citas/:id` | Editar / Eliminar |
| GET/POST | `/api/playlist` | Listar / Crear |
| PUT/DELETE | `/api/playlist/:id` | Editar / Eliminar |
| GET/POST | `/api/razones` | Listar / Crear |
| PUT/DELETE | `/api/razones/:id` | Editar / Eliminar |
| GET/POST | `/api/promesas` | Listar / Crear |
| PUT/DELETE | `/api/promesas/:id` | Editar / Eliminar |
| GET | `/api/cartas` | Obtener carta |
| PUT | `/api/cartas/:id` | Actualizar carta |

---

*Hecho con código y mucho cariño.* 💜
