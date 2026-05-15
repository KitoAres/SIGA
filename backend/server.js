require('dotenv').config();
// deploy panel admin separado
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// Servir frontend desde backend/public
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Rutas API
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

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Solo escuchar puerto cuando corre localmente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`💜 SIGA corriendo en puerto ${PORT}`);
  });
}

module.exports = app;
