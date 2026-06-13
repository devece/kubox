const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kubox.db');

console.log('🔄 Creando tablas de conserjería...');

// Tabla de bitácora
db.run(`
  CREATE TABLE IF NOT EXISTS bitacora (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo TEXT CHECK(tipo IN ('info', 'alerta', 'incidencia')),
    descripcion TEXT NOT NULL,
    conserje_id INTEGER
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creando tabla bitacora:', err.message);
  } else {
    console.log('✅ Tabla bitacora creada/verificada');
  }
});

// Tabla de encomiendas
db.run(`
  CREATE TABLE IF NOT EXISTS encomiendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
    residente_id INTEGER,
    unidad_id INTEGER,
    remitente TEXT,
    descripcion TEXT,
    estado TEXT DEFAULT 'pendiente',
    fecha_retiro DATETIME,
    conserje_ingreso_id INTEGER,
    conserje_retiro_id INTEGER
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creando tabla encomiendas:', err.message);
  } else {
    console.log('✅ Tabla encomiendas creada/verificada');
  }
});

// Tabla de visitas
db.run(`
  CREATE TABLE IF NOT EXISTS visitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_salida DATETIME,
    visitante_nombre TEXT NOT NULL,
    visitante_rut TEXT,
    visitante_telefono TEXT,
    motivo TEXT,
    unidad_destino_id INTEGER,
    residente_autoriza TEXT,
    placa_vehiculo TEXT,
    estado TEXT DEFAULT 'activa',
    conserje_registro_id INTEGER
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creando tabla visitas:', err.message);
  } else {
    console.log('✅ Tabla visitas creada/verificada');
  }
});

// Verificar tablas creadas
setTimeout(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('bitacora', 'encomiendas', 'visitas')", (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('\n📋 Tablas de conserjería creadas:');
      rows.forEach(row => {
        console.log('  -', row.name);
      });
    }
    db.close();
    console.log('\n✅ Inicialización de conserjería completada');
  });
}, 500);