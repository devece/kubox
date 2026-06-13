const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kubox.db');

console.log('🔄 Creando tabla de comunicados...');

db.run(`
  CREATE TABLE IF NOT EXISTS comunicados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    contenido TEXT,
    autor TEXT,
    autor_rol TEXT,
    destinatarios TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    imagen TEXT,
    adjunto TEXT
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creando tabla comunicados:', err.message);
  } else {
    console.log('✅ Tabla comunicados creada/verificada');
  }
  
  // Verificar tablas
  setTimeout(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('\n📋 Tablas existentes:');
        rows.forEach(row => {
          console.log('  -', row.name);
        });
      }
      db.close();
    });
  }, 500);
});