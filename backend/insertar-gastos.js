const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./kubox.db');

// Primero, verificar que la tabla existe
db.run(`CREATE TABLE IF NOT EXISTS gastos_reales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    condominio_id INTEGER,
    categoria_id INTEGER,
    descripcion TEXT,
    monto INTEGER,
    fecha DATE,
    periodo TEXT
)`);

// Insertar gastos uno por uno
db.serialize(() => {
    db.run(`INSERT OR IGNORE INTO gastos_reales (condominio_id, categoria_id, descripcion, monto, fecha, periodo)
            VALUES (1, 2, 'Luz eléctrica', 150000, '2026-05-10', '2026-05')`);
    
    db.run(`INSERT OR IGNORE INTO gastos_reales (condominio_id, categoria_id, descripcion, monto, fecha, periodo)
            VALUES (1, 3, 'Agua potable', 80000, '2026-05-10', '2026-05')`);
    
    db.run(`INSERT OR IGNORE INTO gastos_reales (condominio_id, categoria_id, descripcion, monto, fecha, periodo)
            VALUES (1, 1, 'Personal (sueldos)', 500000, '2026-05-10', '2026-05')`);
    
    db.run(`INSERT OR IGNORE INTO gastos_reales (condominio_id, categoria_id, descripcion, monto, fecha, periodo)
            VALUES (1, 4, 'Mantención ascensores', 120000, '2026-05-10', '2026-05')`);
    
    // Verificar
    db.all(`SELECT * FROM gastos_reales WHERE periodo = '2026-05'`, (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log(`✅ Insertados ${rows.length} gastos para periodo 2026-05:`);
            rows.forEach(row => {
                console.log(`   - ${row.descripcion}: $${row.monto}`);
            });
        }
        db.close();
    });
});