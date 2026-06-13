const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./kubox.db');

const hashedPassword = bcrypt.hashSync('admin123', 10);

db.run(`INSERT OR REPLACE INTO usuarios (id, email, password, rol) 
        VALUES (1, 'admin@kubox.com', ?, 'admin')`, 
        [hashedPassword], 
        function(err) {
  if (err) {
    console.error('❌ Error:', err.message);
  } else {
    console.log('✅ Usuario admin creado/actualizado exitosamente');
    console.log('   Email: admin@kubox.com');
    console.log('   Contraseña: admin123');
  }
  db.close();
});