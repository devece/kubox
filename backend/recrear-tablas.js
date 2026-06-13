const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kubox.db');

console.log('🔄 Recreando tabla espacios...');

// Eliminar tabla espacios si existe
db.run('DROP TABLE IF EXISTS espacios', (err) => {
  if (err) {
    console.log('No existía tabla espacios o error:', err.message);
  } else {
    console.log('✅ Tabla espacios eliminada');
  }
  
  // Crear tabla espacios con todas las columnas
  db.run(`
    CREATE TABLE espacios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      condominio_id INTEGER DEFAULT 1,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      capacidad INTEGER DEFAULT 0,
      tiene_costo INTEGER DEFAULT 0,
      costo_por_jornada INTEGER DEFAULT 0,
      monto_garantia INTEGER DEFAULT 0,
      horario_semana_inicio TEXT DEFAULT '11:00',
      horario_semana_fin TEXT DEFAULT '22:00',
      horario_fin_semana_inicio TEXT DEFAULT '11:00',
      horario_fin_semana_fin TEXT DEFAULT '02:00',
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creando tabla espacios:', err.message);
    } else {
      console.log('✅ Tabla espacios creada correctamente');
    }
    
    // Verificar tablas
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
      console.log('\n📋 Tablas existentes:');
      rows.forEach(row => {
        console.log('  -', row.name);
      });
      db.close();
    });
  });
});