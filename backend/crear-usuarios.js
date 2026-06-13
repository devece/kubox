const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

console.log('🔄 Ejecutando script de creación de usuarios...');

try {
  const db = new Database('./kubox.db');
  
  const usuarios = [
    { email: 'conserje@kubox.com', password: '123456', rol: 'conserje' },
    { email: 'comite@kubox.com', password: '123456', rol: 'comite' },
    { email: 'juan@kubox.com', password: '123456', rol: 'residente' }
  ];
  
  for (const u of usuarios) {
    const hashedPassword = bcrypt.hashSync(u.password, 10);
    const stmt = db.prepare(`INSERT OR IGNORE INTO usuarios (email, password, rol) VALUES (?, ?, ?)`);
    stmt.run(u.email, hashedPassword, u.rol);
    console.log(`✅ Usuario ${u.email} creado/verificado`);
  }
  
  db.close();
  console.log('✅ Script de usuarios completado');
} catch (error) {
  console.error('❌ Error en script:', error.message);
}