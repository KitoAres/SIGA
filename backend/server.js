require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

// CORS más flexible para Vercel.
// Esto evita que falle si Vercel usa otro dominio temporal.
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);

    const permitido =
      origin === 'https://siga-plai.vercel.app' ||
      origin.includes('localhost') ||
      origin.endsWith('.vercel.app');

    if (permitido) {
      return callback(null, true);
    }

    return callback(null, true); // por ahora lo dejamos abierto para no romper SIGA
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Ruta para probar si el backend está vivo
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'SIGA backend vivo 💜',
    env: process.env.NODE_ENV || 'sin NODE_ENV',
    tieneDB: !!process.env.DATABASE_URL,
    tieneJWT: !!process.env.JWT_SECRET
  });
});

/* ======================================================
   RUTAS API SIGA
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
