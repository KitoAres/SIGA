require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('trust proxy', 1);

// Seguridad básica HTTP. CSP apagado porque tu frontend actual usa estilos/scripts inline.
app.use(helmet({
  contentSecurityPolicy: false
}));

// Límite general para evitar abuso simple de la API.
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

const allowedOrigins = [
  'https://siga-plai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permite requests sin origin: navegador local, Postman, health checks, etc.
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

/* ======================================================
   RUTAS API SIGA
   programar esto fue sufrir, pero con amor 💜
   ====================================================== */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/recuerdos', require('./routes/recuerdos'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/playlist', require('./routes/playlist'));
app.use('/api/razones', require('./routes/razones'));
app.use('/api/promesas', require('./routes/promesas'));
app.use('/api/cartas', require('./routes/cartas'));
app.use('/api/tiempo', require('./routes/tiempo'));
app.use('/api/calma', require('./routes/calma'));
app.use('/api/cajita', require('./routes/cajita'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/puntos', require('./routes/puntos'));
app.use('/api/espacio', require('./routes/espacio'));

/* ======================================================
   SIGy — IA suave de SIGA ✨
   ====================================================== */
app.use('/api/sigy', require('./routes/sigy'));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`💜 SIGA corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
