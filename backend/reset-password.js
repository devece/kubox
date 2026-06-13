const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./kubox.db');

const nuevaContrasena = 'admin123';
const hashedPassword = bcrypt.hashSync(nuevaContrasena, 10);

db.run(`UPDATE usuarios SET password = ? WHERE email = 'admin@kubox.com'`, 
  [hashedPassword], 
  function(err) {
    if (err) {
      console.error('❌ Error:', err.message);
    } else {
      console.log('✅ Contraseña actualizada para admin@kubox.com');
      console.log('   Nueva contraseña: 123456');
    }
    
    // Verificar que funciona
    db.get(`SELECT email FROM usuarios WHERE email = 'admin@kubox.com' AND password = ?`, 
      [hashedPassword], 
      (err, row) => {
        if (row) {
          console.log('✅ Verificación: Contraseña correcta');
        } else {
          console.log('❌ Verificación falló');
        }
        db.close();
      });
  });