require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

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
   SIGy — la mini IA emocional de SIGA ✨ que boniiitooo
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
