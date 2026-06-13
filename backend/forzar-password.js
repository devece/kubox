const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./kubox.db');

// Generar hash de 'admin123'
const passwordCorrecta = 'admin123';
const hashCorrecto = bcrypt.hashSync(passwordCorrecta, 10);

console.log('Hash generado:', hashCorrecto);

// Actualizar la contraseña del admin
db.run(`UPDATE usuarios SET password = ? WHERE email = 'admin@kubox.com'`, 
  [hashCorrecto], 
  function(err) {
    if (err) {
      console.error('Error:', err.message);
    } else {
      console.log(`✅ Contraseña actualizada para admin@kubox.com`);
      console.log(`   Nuevo hash: ${hashCorrecto}`);
    }
    
    // Verificar que funciona
    db.get(`SELECT email FROM usuarios WHERE email = 'admin@kubox.com'`, (err, row) => {
      if (row) {
        // Probar la verificación
        const verify = bcrypt.compareSync(passwordCorrecta, hashCorrecto);
        console.log(`✅ Verificación: la contraseña '${passwordCorrecta}' es ${verify ? 'válida' : 'inválida'}`);
      }
      db.close();
    });
  });