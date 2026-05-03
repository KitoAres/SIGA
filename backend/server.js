const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend dentro de backend/frontend
const frontendPath = path.join(__dirname, 'frontend');
const indexPath = path.join(frontendPath, 'index.html');

console.log('📁 __dirname:', __dirname);
console.log('📁 frontendPath:', frontendPath);
console.log('📄 indexPath:', indexPath);
console.log('📄 index exists:', fs.existsSync(indexPath));

app.use(express.static(frontendPath));

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/recuerdos', require('./routes/recuerdos'));
app.use('/api/citas', require('./routes/citas'));
app.use('/api/playlist', require('./routes/playlist'));
app.use('/api/razones', require('./routes/razones'));
app.use('/api/promesas', require('./routes/promesas'));
app.use('/api/cartas', require('./routes/cartas'));

// Página principal
app.get('/', (req, res) => {
  if (!fs.existsSync(indexPath)) {
    return res.status(500).send(`
      <h2>No se encontró backend/frontend/index.html</h2>
      <p><b>__dirname:</b> ${__dirname}</p>
      <p><b>frontendPath:</b> ${frontendPath}</p>
      <p><b>indexPath:</b> ${indexPath}</p>
      <p><b>index exists:</b> ${fs.existsSync(indexPath)}</p>
    `);
  }

  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`💙 SIGA corriendo en http://localhost:${PORT}`);
  console.log(`📁 Frontend servido desde: ${frontendPath}`);
  console.log('Demo: miamor / 123');
});
