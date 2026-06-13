const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kubox.db');

// Crear tabla espacios
db.run(`CREATE TABLE IF NOT EXISTS espacios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  condominio_id INTEGER DEFAULT 1,
  nombre TEXT,
  descripcion TEXT,
  capacidad INTEGER,
  tiene_costo INTEGER DEFAULT 0,
  costo_por_hora INTEGER DEFAULT 0,
  horario_inicio TEXT DEFAULT '09:00',
  horario_fin TEXT DEFAULT '22:00',
  activo INTEGER DEFAULT 1
)`, (err) => {
  if (err) {
    console.error('Error creando tabla espacios:', err.message);
  } else {
    console.log('✅ Tabla espacios creada/verificada');
  }
});

// Crear tabla reservas
db.run(`CREATE TABLE IF NOT EXISTS reservas (
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
  comentario TEXT
)`, (err) => {
  if (err) {
    console.error('Error creando tabla reservas:', err.message);
  } else {
    console.log('✅ Tabla reservas creada/verificada');
  }
});

// Verificar tablas
setTimeout(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    console.log('\n📋 Tablas existentes:');
    rows.forEach(row => {
      console.log('  -', row.name);
    });
    db.close();
  });
}, 500);