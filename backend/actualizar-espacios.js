const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('kubox.db');

// Verificar y agregar columnas si no existen
db.run('ALTER TABLE espacios_comunes ADD COLUMN horario_semana_inicio TEXT DEFAULT \"10:00\"', (e) => console.log(e ? '⚠️ ' + e.message : '✅ horario_semana_inicio'));
db.run('ALTER TABLE espacios_comunes ADD COLUMN horario_semana_fin TEXT DEFAULT \"22:00\"', (e) => console.log(e ? '⚠️ ' + e.message : '✅ horario_semana_fin'));
db.run('ALTER TABLE espacios_comunes ADD COLUMN horario_festivo_inicio TEXT DEFAULT \"10:00\"', (e) => console.log(e ? '⚠️ ' + e.message : '✅ horario_festivo_inicio'));
db.run('ALTER TABLE espacios_comunes ADD COLUMN horario_festivo_fin TEXT DEFAULT \"02:00\"', (e) => console.log(e ? '⚠️ ' + e.message : '✅ horario_festivo_fin'));
db.run('ALTER TABLE espacios_comunes ADD COLUMN costo_dia_semana INTEGER DEFAULT 0', (e) => console.log(e ? '⚠️ ' + e.message : '✅ costo_dia_semana'));
db.run('ALTER TABLE espacios_comunes ADD COLUMN costo_dia_festivo INTEGER DEFAULT 0', (e) => console.log(e ? '⚠️ ' + e.message : '✅ costo_dia_festivo'));
db.run('ALTER TABLE espacios_comunes ADD COLUMN dias_festivos TEXT', (e) => console.log(e ? '⚠️ ' + e.message : '✅ dias_festivos'));

setTimeout(() => db.close(), 1000);
