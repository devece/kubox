const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./kubox.db');

const nuevoEmail = 'prueba@kubox.com';
const nuevaPassword = '123456';
const hashedPassword = bcrypt.hashSync(nuevaPassword, 10);

// Insertar nuevo usuario
db.run(`INSERT OR REPLACE INTO usuarios (email, password, rol) VALUES (?, ?, 'admin')`, 
  [nuevoEmail, hashedPassword], 
  function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
    } else {
      console.log('✅ Nuevo usuario admin creado');
      console.log('   Email:', nuevoEmail);
      console.log('   Contraseña:', nuevaPassword);
    }
    
    // Verificar
    db.get(`SELECT id, email, rol FROM usuarios WHERE email = ?`, [nuevoEmail], (err, row) => {
      console.log('Verificación:', row);
      db.close();
    });
  });