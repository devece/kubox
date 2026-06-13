Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIAGNÓSTICO COMPLETO - KUBOX" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar backend
Write-Host "1. BACKEND" -ForegroundColor Green
try {
     = Invoke-WebRequest -Uri "http://localhost:3001/api/residentes" -UseBasicParsing -TimeoutSec 3
    Write-Host "   ✅ Backend corriendo en puerto 3001" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend no responde (¿está corriendo?)" -ForegroundColor Red
}

# 2. Verificar tablas
Write-Host ""
Write-Host "2. TABLAS EN BASE DE DATOS" -ForegroundColor Green
cd D:\kubox\backend
 = @("usuarios", "residentes", "unidades", "gastos", "gastos_comunes", "gastos_unidad", "espacios_comunes", "reservas", "multas", "bitacora", "encomiendas", "visitas", "equipos", "mantenciones_programadas", "comunicados")
foreach ( in ) {
     = node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.get('SELECT 1 FROM  LIMIT 1', (err, row) => { console.log(err ? 'NO' : 'SI'); db.close(); });" 2>
    if ( -like "*SI*") {
        Write-Host "   ✅ " -ForegroundColor Green
    } else {
        Write-Host "   ❌  (no existe o vacía)" -ForegroundColor Red
    }
}

# 3. Verificar usuarios
Write-Host ""
Write-Host "3. USUARIOS REGISTRADOS" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT email, rol FROM usuarios', (err, rows) => { rows.forEach(r => console.log('   - ' + r.email + ' (' + r.rol + ')')); db.close(); });" 2>

# 4. Verificar unidades con residentes
Write-Host ""
Write-Host "4. UNIDADES CON RESIDENTES ASIGNADOS" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT u.numero, r.nombre FROM unidades u LEFT JOIN residentes r ON r.id = u.residente_id', (err, rows) => { rows.forEach(r => console.log('   - Unidad ' + r.numero + ' -> ' + (r.nombre || 'Sin residente'))); db.close(); });" 2>

# 5. Verificar gastos comunes generados
Write-Host ""
Write-Host "5. GASTOS COMUNES GENERADOS" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT periodo, monto_total, fecha_vencimiento FROM gastos_comunes', (err, rows) => { rows.forEach(r => console.log('   - ' + r.periodo + ' - $' + r.monto_total + ' (vence: ' + r.fecha_vencimiento + ')')); db.close(); });" 2>

# 6. Verificar espacios comunes
Write-Host ""
Write-Host "6. ESPACIOS COMUNES" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT nombre, capacidad, cobro_activo FROM espacios_comunes', (err, rows) => { rows.forEach(r => console.log('   - ' + r.nombre + ' (Cap: ' + r.capacidad + ') ' + (r.cobro_activo ? '💰' : ''))); db.close(); });" 2>

# 7. Verificar reservas
Write-Host ""
Write-Host "7. RESERVAS" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT id, fecha, costo_total, estado FROM reservas', (err, rows) => { rows.forEach(r => console.log('   - Reserva ID ' + r.id + ' - ' + r.fecha + ' - $' + (r.costo_total || 0) + ' - ' + r.estado)); db.close(); });" 2>

# 8. Verificar multas
Write-Host ""
Write-Host "8. MULTAS" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT m.id, u.numero, m.monto, m.pagado FROM multas m JOIN unidades u ON u.id = m.unidad_id', (err, rows) => { rows.forEach(r => console.log('   - Unidad ' + r.numero + ' - $' + r.monto + ' - ' + (r.pagado ? 'Pagado' : 'Pendiente'))); db.close(); });" 2>

# 9. Verificar comunicados
Write-Host ""
Write-Host "9. COMUNICADOS" -ForegroundColor Green
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('kubox.db'); db.all('SELECT id, titulo, autor FROM comunicados', (err, rows) => { rows.forEach(r => console.log('   - ' + r.titulo + ' (' + r.autor + ')')); db.close(); });" 2>

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIAGNÓSTICO COMPLETADO" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
