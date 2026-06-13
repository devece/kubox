const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kubox.db');

console.log('🔄 Creando tabla reservas...');

db.run(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    espacio_id INTEGER,
    residente_id INTEGER,
    unidad_id INTEGER,
    fecha DATE,
    hora_inicio TEXT,
    hora_fin TEXT,
    estado TEXT DEFAULT 'pendiente',
    monto_total INTEGER DEFAULT 0,
    pagado INTEGER DEFAULT 0,
    comentario TEXT,
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creando tabla reservas:', err.message);
  } else {
    console.log('✅ Tabla reservas creada/verificada');
  }
  
  // Verificar todas las tablas
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
});