const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./kubox.db');

// ============================================
// LOGIN
// ============================================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Credenciales incorrectas' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
        res.json({ id: user.id, email: user.email, rol: user.rol });
    });
});

// ============================================
// DASHBOARD - GRÁFICOS
// ============================================
app.get('/api/dashboard-stats', (req, res) => {
    db.get('SELECT COUNT(*) as total_unidades FROM unidades', (err, row) => {
        const totalUnidades = row?.total_unidades || 0;
        
        db.get('SELECT COUNT(*) as ocupadas FROM unidades WHERE residente_id IS NOT NULL', (err2, row2) => {
            const ocupadas = row2?.ocupadas || 0;
            
            db.get('SELECT COUNT(*) as total_residentes FROM residentes', (err3, row3) => {
                const totalResidentes = row3?.total_residentes || 0;
                
                res.json({ 
                    total_unidades: totalUnidades,
                    ocupadas: ocupadas,
                    total_residentes: totalResidentes,
                    morosos: 0,
                    recaudado_mes: 0,
                    deuda_total: 0,
                    recaudado_total: 0
                });
            });
        });
    });
});

app.get('/api/grafico-gastos-categoria', (req, res) => {
    db.all(`SELECT categoria, SUM(monto) as total FROM gastos WHERE categoria IS NOT NULL GROUP BY categoria`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.get('/api/grafico-ingresos', (req, res) => {
    db.all(`SELECT strftime('%Y-%m', fecha) as periodo, SUM(monto) as total_recaudado FROM gastos GROUP BY strftime('%Y-%m', fecha) ORDER BY periodo DESC LIMIT 6`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.get('/api/grafico-morosidad', (req, res) => {
    db.all(`SELECT 
                strftime('%Y-%m', gc.fecha_emision) as periodo,
                SUM(CASE WHEN gu.pagado = 1 THEN 1 ELSE 0 END) as pagados,
                SUM(CASE WHEN gu.pagado = 0 THEN 1 ELSE 0 END) as morosos 
            FROM gastos_comunes gc
            JOIN gastos_unidad gu ON gu.gasto_comun_id = gc.id
            GROUP BY strftime('%Y-%m', gc.fecha_emision)
            ORDER BY periodo DESC LIMIT 6`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// ============================================
// GASTOS
// ============================================
app.get('/api/gastos', (req, res) => {
    db.all('SELECT * FROM gastos ORDER BY fecha DESC, id DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/gastos', (req, res) => {
    const { concepto, monto, fecha, categoria, proveedor, es_cuotas, total_cuotas, cuota_actual, monto_cuota } = req.body;
    db.run(`INSERT INTO gastos (concepto, monto, fecha, categoria, proveedor, es_cuotas, total_cuotas, cuota_actual, monto_cuota) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [concepto, monto, fecha, categoria, proveedor, es_cuotas ? 1 : 0, total_cuotas || 1, cuota_actual || 1, monto_cuota || monto],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/gastos/:id', (req, res) => {
    const { concepto, monto, fecha, categoria, proveedor, es_cuotas, total_cuotas, cuota_actual, monto_cuota } = req.body;
    db.run(`UPDATE gastos SET concepto = ?, monto = ?, fecha = ?, categoria = ?, proveedor = ?, es_cuotas = ?, total_cuotas = ?, cuota_actual = ?, monto_cuota = ? WHERE id = ?`,
        [concepto, monto, fecha, categoria, proveedor, es_cuotas ? 1 : 0, total_cuotas || 1, cuota_actual || 1, monto_cuota || monto, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/gastos/:id', (req, res) => {
    db.run('DELETE FROM gastos WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ============================================
// CATEGORIAS GASTOS
// ============================================
app.get('/api/categorias-gastos', (req, res) => {
    db.all('SELECT * FROM categorias_gastos ORDER BY nombre', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ============================================
// UNIDADES
// ============================================
app.get('/api/unidades', (req, res) => {
    db.all(`SELECT u.*, r.nombre as residente_nombre 
            FROM unidades u 
            LEFT JOIN residentes r ON r.id = u.residente_id`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/unidades', (req, res) => {
    const { numero, torre, tipo, metros_cuadrados, estacionamiento, bodega, residente_id } = req.body;
    db.run('INSERT INTO unidades (numero, torre, tipo, metros_cuadrados, estacionamiento, bodega, residente_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [numero, torre, tipo, metros_cuadrados, estacionamiento ? 1 : 0, bodega ? 1 : 0, residente_id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/unidades/:id', (req, res) => {
    const { numero, torre, tipo, metros_cuadrados, estacionamiento, bodega, residente_id } = req.body;
    db.run('UPDATE unidades SET numero = ?, torre = ?, tipo = ?, metros_cuadrados = ?, estacionamiento = ?, bodega = ?, residente_id = ? WHERE id = ?',
        [numero, torre, tipo, metros_cuadrados, estacionamiento ? 1 : 0, bodega ? 1 : 0, residente_id, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/unidades/:id', (req, res) => {
    db.run('DELETE FROM unidades WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ============================================
// RESIDENTES
// ============================================
app.get('/api/residentes', (req, res) => {
    db.all('SELECT * FROM residentes', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/residentes', (req, res) => {
    const { nombre, email, telefono, condominio_id } = req.body;
    db.run('INSERT INTO residentes (nombre, email, telefono, condominio_id) VALUES (?, ?, ?, ?)',
        [nombre, email, telefono, condominio_id || 1],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/residentes/:id', (req, res) => {
    const { nombre, email, telefono } = req.body;
    db.run('UPDATE residentes SET nombre = ?, email = ?, telefono = ? WHERE id = ?',
        [nombre, email, telefono, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/residentes/:id', (req, res) => {
    db.run('DELETE FROM residentes WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ============================================
// ESPACIOS COMUNES
// ============================================
app.get('/api/espacios', (req, res) => {
    db.all('SELECT * FROM espacios_comunes', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/espacios', (req, res) => {
    const { nombre, descripcion, capacidad, requiere_autorizacion, cobro_activo,
            horario_semana_inicio, horario_semana_fin, horario_festivo_inicio,
            horario_festivo_fin, costo_dia_semana, costo_dia_festivo, garantia, 
            tiene_juegos_inflables, monto_extra_juegos, dias_festivos } = req.body;

    const sql = `INSERT INTO espacios_comunes 
        (nombre, descripcion, capacidad, requiere_autorizacion, cobro_activo,
         horario_semana_inicio, horario_semana_fin, horario_festivo_inicio,
         horario_festivo_fin, costo_dia_semana, costo_dia_festivo, garantia, 
         tiene_juegos_inflables, monto_extra_juegos, dias_festivos, condominio_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

    db.run(sql, [nombre, descripcion, capacidad, requiere_autorizacion ? 1 : 0, cobro_activo ? 1 : 0,
         horario_semana_inicio, horario_semana_fin, horario_festivo_inicio, horario_festivo_fin,
         costo_dia_semana || 0, costo_dia_festivo || 0, garantia || 0,
         tiene_juegos_inflables ? 1 : 0, monto_extra_juegos || 0, dias_festivos || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/espacios/:id', (req, res) => {
    const { nombre, descripcion, capacidad, requiere_autorizacion, cobro_activo,
            horario_semana_inicio, horario_semana_fin, horario_festivo_inicio,
            horario_festivo_fin, costo_dia_semana, costo_dia_festivo, garantia,
            tiene_juegos_inflables, monto_extra_juegos, dias_festivos } = req.body;

    const sql = `UPDATE espacios_comunes SET 
            nombre = ?, descripcion = ?, capacidad = ?, requiere_autorizacion = ?, 
            cobro_activo = ?, horario_semana_inicio = ?, horario_semana_fin = ?,
            horario_festivo_inicio = ?, horario_festivo_fin = ?, costo_dia_semana = ?,
            costo_dia_festivo = ?, garantia = ?, tiene_juegos_inflables = ?,
            monto_extra_juegos = ?, dias_festivos = ?
            WHERE id = ?`;

    db.run(sql, [nombre, descripcion, capacidad, requiere_autorizacion ? 1 : 0, cobro_activo ? 1 : 0,
         horario_semana_inicio, horario_semana_fin, horario_festivo_inicio, horario_festivo_fin,
         costo_dia_semana || 0, costo_dia_festivo || 0, garantia || 0,
         tiene_juegos_inflables ? 1 : 0, monto_extra_juegos || 0, dias_festivos || '', req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/espacios/:id', (req, res) => {
    db.run('DELETE FROM espacios_comunes WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ============================================
// RESERVAS
// ============================================
app.get('/api/reservas', (req, res) => {
    db.all('SELECT id, espacio_id, fecha, hora_inicio, hora_fin, motivo, unidad_id, estado, costo_total, tiene_extra, monto_extra, garantia_aplicada, check_out FROM reservas ORDER BY fecha DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/reservas', (req, res) => {
    const { espacio_id, fecha, hora_inicio, hora_fin, motivo, unidad_id, costo_total, tiene_extra, monto_extra, estado } = req.body;
    
    db.run(`INSERT INTO reservas (espacio_id, fecha, hora_inicio, hora_fin, motivo, unidad_id, costo_total, tiene_extra, monto_extra, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [espacio_id, fecha, hora_inicio, hora_fin, motivo, unidad_id, costo_total || 0, tiene_extra || 0, monto_extra || 0, estado || 'pendiente'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});
app.put('/api/reservas/:id', (req, res) => {
    const { estado, check_out, garantia_aplicada } = req.body;
    
    db.get('SELECT unidad_id, costo_total FROM reservas WHERE id = ?', [req.params.id], (err, reserva) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada' });
        
        let nuevoCostoTotal = reserva.costo_total;
        
        if (garantia_aplicada === 1) {
            nuevoCostoTotal = reserva.costo_total * 2;
        }
        
        db.run('UPDATE reservas SET estado = ?, check_out = ?, garantia_aplicada = ?, costo_total = ? WHERE id = ?',
            [estado, check_out, garantia_aplicada || 0, nuevoCostoTotal, req.params.id],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ updated: this.changes, costo_final: nuevoCostoTotal });
            });
    });
});
// ============================================
// GASTOS COMUNES
// ============================================
app.get('/api/gastos-periodos', (req, res) => {
    db.all('SELECT DISTINCT periodo FROM gastos_comunes ORDER BY periodo DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(r => r.periodo));
    });
});

app.get('/api/gastos-comunes/:periodo', (req, res) => {
    const periodo = decodeURIComponent(req.params.periodo);
    db.all(`SELECT gu.*, u.numero as unidad_numero, gc.periodo, gc.concepto, gc.fecha_vencimiento
            FROM gastos_unidad gu
            JOIN unidades u ON u.id = gu.unidad_id
            JOIN gastos_comunes gc ON gc.id = gu.gasto_comun_id
            WHERE gc.periodo = ?
            ORDER BY u.numero`, 
        [periodo], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
});

app.post('/api/generar-gastos-comunes', (req, res) => {
    const { periodo, mes, anio } = req.body;
    
    const fechaInicio = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const fechaFin = `${anio}-${String(mes).padStart(2, '0')}-31`;
    
    db.get('SELECT SUM(monto_cuota) as total FROM gastos WHERE fecha BETWEEN ? AND ?', [fechaInicio, fechaFin], (err, gastoRow) => {
        if (err) return res.status(500).json({ error: err.message });
        
        let totalGastos = gastoRow.total || 0;
        
        db.get('SELECT SUM(costo_total) as total_reservas FROM reservas WHERE fecha BETWEEN ? AND ?', [fechaInicio, fechaFin], (err, reservasRow) => {
            if (err) return res.status(500).json({ error: err.message });
            
            const totalReservas = reservasRow?.total_reservas || 0;
            totalGastos += totalReservas;
            
            // Sumar multas del período (incluyendo garantías)
            db.get('SELECT SUM(monto) as total_multas FROM multas WHERE fecha BETWEEN ? AND ?', [fechaInicio, fechaFin], (err, multasRow) => {
                if (err) return res.status(500).json({ error: err.message });
                
                const totalMultas = multasRow?.total_multas || 0;
                totalGastos += totalMultas;
                
                if (totalGastos === 0) {
                    return res.status(400).json({ error: 'No hay gastos, reservas ni multas en el período seleccionado' });
                }
                
                db.all('SELECT id, metros_cuadrados FROM unidades WHERE metros_cuadrados > 0', (err, unidades) => {
                    if (err || !unidades.length) {
                        return res.status(500).json({ error: 'No hay unidades con metros cuadrados' });
                    }
                    
                    const totalMetros = unidades.reduce((sum, u) => sum + u.metros_cuadrados, 0);
                    const fechaEmision = new Date().toISOString().split('T')[0];
                    const fechaVencimiento = new Date();
                    fechaVencimiento.setDate(fechaVencimiento.getDate() + 10);
                    const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0];
                    
                    db.run(`INSERT INTO gastos_comunes (condominio_id, periodo, concepto, monto_total, fecha_emision, fecha_vencimiento, pagado) 
                            VALUES (1, ?, 'Gastos Comunes', ?, ?, ?, 0)`,
                        [periodo, totalGastos, fechaEmision, fechaVencimientoStr],
                        function(err) {
                            if (err) return res.status(500).json({ error: err.message });
                            
                            const gastoComunId = this.lastID;
                            let insertados = 0;
                            
                            unidades.forEach(unidad => {
                                const porcentaje = unidad.metros_cuadrados / totalMetros;
                                const montoUnidad = Math.round(totalGastos * porcentaje);
                                
                                db.run(`INSERT INTO gastos_unidad (gasto_comun_id, unidad_id, monto_base, monto_total, pagado) 
                                        VALUES (?, ?, ?, ?, 0)`,
                                    [gastoComunId, unidad.id, montoUnidad, montoUnidad],
                                    (err) => {
                                        if (err) console.error(err);
                                        insertados++;
                                        if (insertados === unidades.length) {
                                            res.json({ success: true, message: `Cobros generados para ${unidades.length} unidades`, total: totalGastos });
                                        }
                                    });
                            });
                        });
                });
            });
        });
    });
});

app.delete('/api/limpiar-gastos-comunes', (req, res) => {
    db.run('DELETE FROM gastos_unidad', (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run('DELETE FROM gastos_comunes', (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.delete('/api/limpiar-gastos-periodo/:periodo', (req, res) => {
    const periodo = decodeURIComponent(req.params.periodo);
    db.run('DELETE FROM gastos_unidad WHERE gasto_comun_id IN (SELECT id FROM gastos_comunes WHERE periodo = ?)', [periodo], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run('DELETE FROM gastos_comunes WHERE periodo = ?', [periodo], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
});

app.post('/api/pagar-gasto-unidad', (req, res) => {
    const { gasto_unidad_id, fecha_pago } = req.body;
    db.run('UPDATE gastos_unidad SET pagado = 1, fecha_pago = ? WHERE id = ?', [fecha_pago, gasto_unidad_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// ============================================
// CONSERJERIA
// ============================================

// BITÁCORA
app.get('/api/bitacora', (req, res) => {
    db.all('SELECT * FROM bitacora ORDER BY fecha DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/bitacora', (req, res) => {
    const { tipo, descripcion, conserje_nombre } = req.body;
    db.run(`INSERT INTO bitacora (tipo, descripcion, fecha, conserje_nombre) VALUES (?, ?, datetime('now'), ?)`,
        [tipo || 'info', descripcion, conserje_nombre || 'Conserje'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.delete('/api/bitacora/:id', (req, res) => {
    db.run('DELETE FROM bitacora WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ENCOMIENDAS
app.get('/api/encomiendas', (req, res) => {
    db.all(`SELECT e.*, r.nombre as residente_nombre, u.numero as unidad_numero
            FROM encomiendas e
            LEFT JOIN residentes r ON r.id = e.residente_id
            LEFT JOIN unidades u ON u.residente_id = r.id
            ORDER BY e.fecha_ingreso DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/encomiendas/residente/:email', (req, res) => {
    const email = req.params.email;
    db.get('SELECT id FROM residentes WHERE email = ?', [email], (err, residente) => {
        if (err || !residente) return res.status(404).json({ error: 'Residente no encontrado' });
        db.all('SELECT * FROM encomiendas WHERE residente_id = ? ORDER BY fecha_ingreso DESC',
            [residente.id], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows || []);
            });
    });
});

app.post('/api/encomiendas', (req, res) => {
    const { residente_id, remitente, descripcion } = req.body;
    db.run(`INSERT INTO encomiendas (residente_id, remitente, descripcion, fecha_ingreso, estado) VALUES (?, ?, ?, datetime('now'), 'pendiente')`,
        [residente_id, remitente, descripcion],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/encomiendas/:id/entregar', (req, res) => {
    db.run(`UPDATE encomiendas SET estado = 'entregado', fecha_retiro = datetime('now') WHERE id = ?`,
        [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/encomiendas/:id', (req, res) => {
    db.run('DELETE FROM encomiendas WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// VISITAS
app.get('/api/visitas', (req, res) => {
    db.all(`SELECT v.*, u.numero as unidad_numero
            FROM visitas v
            LEFT JOIN unidades u ON u.id = v.unidad_destino_id
            ORDER BY v.fecha_entrada DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/visitas', (req, res) => {
    const { visitante_nombre, visitante_rut, visitante_telefono, motivo, unidad_destino_id, placa_vehiculo } = req.body;
    db.run(`INSERT INTO visitas (visitante_nombre, visitante_rut, visitante_telefono, motivo, unidad_destino_id, placa_vehiculo, fecha_entrada, estado) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'activa')`,
        [visitante_nombre, visitante_rut || null, visitante_telefono || null, motivo || null, unidad_destino_id || null, placa_vehiculo || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/visitas/:id/salir', (req, res) => {
    db.run(`UPDATE visitas SET estado = 'finalizada', fecha_salida = datetime('now') WHERE id = ?`,
        [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/visitas/:id', (req, res) => {
    db.run('DELETE FROM visitas WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// ============================================
// MANTENIMIENTO
// ============================================
app.get('/api/equipos', (req, res) => {
    db.all('SELECT * FROM equipos WHERE activo = 1', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/mantenciones', (req, res) => {
    db.all('SELECT * FROM mantenciones_programadas ORDER BY fecha_programada ASC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/mantenciones', (req, res) => {
    const { equipo_id, fecha_programada, descripcion, prioridad, responsable } = req.body;
    db.run('INSERT INTO mantenciones_programadas (equipo_id, fecha_programada, descripcion, prioridad, estado, responsable) VALUES (?, ?, ?, ?, ?, ?)',
        [equipo_id, fecha_programada, descripcion || 'Mantención programada', prioridad || 'normal', 'pendiente', responsable || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/mantenciones/:id', (req, res) => {
    const { estado, fecha_realizacion, observaciones } = req.body;
    db.run('UPDATE mantenciones_programadas SET estado = ?, fecha_realizacion = ?, observaciones = ? WHERE id = ?',
        [estado, fecha_realizacion, observaciones, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

// ============================================
// GARANTIAS
// ============================================
app.post('/api/aplicar-garantia', (req, res) => {
    const { reserva_id, aplicar } = req.body;
    
    db.get('SELECT unidad_id, costo_total FROM reservas WHERE id = ?', [reserva_id], (err, reserva) => {
        if (err || !reserva) return res.status(500).json({ error: 'Reserva no encontrada' });
        
        if (aplicar) {
            const periodo = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
            db.run(`INSERT INTO multas (unidad_id, fecha, motivo, monto, periodo) 
                    VALUES (?, date('now'), 'Garantía aplicada por mal uso de espacio común', ?, ?)`,
                [reserva.unidad_id, reserva.costo_total, periodo], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    db.run('UPDATE reservas SET garantia_aplicada = 1, garantia_cobrada = 1 WHERE id = ?', [reserva_id]);
                    res.json({ success: true });
                });
        } else {
            db.run('UPDATE reservas SET garantia_aplicada = 0 WHERE id = ?', [reserva_id]);
            res.json({ success: true });
        }
    });
});

// ============================================
// AGREGAR COLUMNAS FALTANTES
// ============================================
db.run('ALTER TABLE espacios_comunes ADD COLUMN tiene_juegos_inflables INTEGER DEFAULT 0', (e) => {});
db.run('ALTER TABLE espacios_comunes ADD COLUMN monto_extra_juegos INTEGER DEFAULT 0', (e) => {});

// ============================================
// RUTAS PARA RESIDENTES
// ============================================

// Obtener residente por email
app.get('/api/residentes/email/:email', (req, res) => {
    const email = req.params.email;
    db.get('SELECT * FROM residentes WHERE email = ?', [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Residente no encontrado' });
        res.json(row);
    });
});

// Obtener unidad por residente_id
app.get('/api/unidades/residente/:residenteId', (req, res) => {
    const residenteId = req.params.residenteId;
    db.get('SELECT * FROM unidades WHERE residente_id = ?', [residenteId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Obtener gastos comunes por unidad
app.get('/api/gastos-comunes/unidad/:unidadId', (req, res) => {
    const unidadId = req.params.unidadId;
    const sql = `SELECT gu.*, gc.periodo, gc.concepto, gc.fecha_vencimiento
                 FROM gastos_unidad gu
                 JOIN gastos_comunes gc ON gc.id = gu.gasto_comun_id
                 WHERE gu.unidad_id = ?
                 ORDER BY gc.periodo DESC`;
    db.all(sql, [unidadId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Obtener visitas por unidad
app.get('/api/visitas/unidad/:unidadId', (req, res) => {
    const unidadId = req.params.unidadId;
    db.all('SELECT * FROM visitas WHERE unidad_destino_id = ? ORDER BY fecha_entrada DESC', [unidadId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
// ========== MULTAS ==========

app.get('/api/multas', (req, res) => {
    db.all(`SELECT m.*, u.numero as unidad_numero 
            FROM multas m 
            JOIN unidades u ON u.id = m.unidad_id 
            ORDER BY m.fecha DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/multas', (req, res) => {
    const { unidad_id, fecha, motivo, monto } = req.body;
    const periodo = new Date(fecha).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    
    db.run(`INSERT INTO multas (unidad_id, fecha, motivo, monto, periodo) 
            VALUES (?, ?, ?, ?, ?)`,
        [unidad_id, fecha, motivo, monto, periodo],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.put('/api/multas/:id', (req, res) => {
    const { pagado, fecha_pago } = req.body;
    db.run('UPDATE multas SET pagado = ?, fecha_pago = ? WHERE id = ?',
        [pagado, fecha_pago, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});

app.delete('/api/multas/:id', (req, res) => {
    db.run('DELETE FROM multas WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});
// ========== COMUNICADOS ==========

// Obtener todos los comunicados
app.get('/api/comunicados', (req, res) => {
    db.all('SELECT * FROM comunicados ORDER BY fecha DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Crear nuevo comunicado
app.post('/api/comunicados', (req, res) => {
    const { titulo, contenido, autor, autor_rol, destinatarios, residentes_seleccionados, adjunto_url, adjunto_nombre } = req.body;
    let destinoJSON;
    if (destinatarios === 'seleccionados') {
        destinoJSON = JSON.stringify({ tipo: 'seleccionados', ids: residentes_seleccionados || [] });
    } else {
        destinoJSON = JSON.stringify({ tipo: destinatarios || 'todos' });
    }
    db.run(`INSERT INTO comunicados (titulo, contenido, autor, autor_rol, destino, adjunto_url, adjunto_nombre, fecha)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [titulo, contenido, autor || 'Administrador', autor_rol || 'admin', destinoJSON, adjunto_url || null, adjunto_nombre || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

// Eliminar comunicado
app.delete('/api/comunicados/:id', (req, res) => {
    db.run('DELETE FROM comunicados WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});
// ========== CONFIGURACIÓN EDIFICIO ==========

// Obtener configuración
app.get('/api/config-edificio', (req, res) => {
    db.get('SELECT * FROM config_edificio WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// Actualizar configuración
app.put('/api/config-edificio', (req, res) => {
    const { nombre_edificio, banco, tipo_cuenta, numero_cuenta, rut_empresa, email_contacto, telefono_contacto, instrucciones_pago } = req.body;
    
    db.run(`UPDATE config_edificio SET 
        nombre_edificio = ?, banco = ?, tipo_cuenta = ?, numero_cuenta = ?, 
        rut_empresa = ?, email_contacto = ?, telefono_contacto = ?, instrucciones_pago = ?
        WHERE id = 1`,
        [nombre_edificio, banco, tipo_cuenta, numero_cuenta, rut_empresa, email_contacto, telefono_contacto, instrucciones_pago],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
});
// ============================================
// SETUP INICIAL DE BASE DE DATOS
// ============================================
app.get('/api/setup', async (req, res) => {
    if (req.query.key !== 'kubox-init-2026') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    const tablas = [
        `CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            rol TEXT DEFAULT 'residente'
        )`,
        `CREATE TABLE IF NOT EXISTS residentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            email TEXT UNIQUE,
            telefono TEXT,
            condominio_id INTEGER DEFAULT 1
        )`,
        `CREATE TABLE IF NOT EXISTS unidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT,
            torre TEXT,
            tipo TEXT,
            metros_cuadrados REAL DEFAULT 0,
            estacionamiento INTEGER DEFAULT 0,
            bodega INTEGER DEFAULT 0,
            residente_id INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            concepto TEXT,
            monto REAL,
            fecha TEXT,
            categoria TEXT,
            proveedor TEXT,
            es_cuotas INTEGER DEFAULT 0,
            total_cuotas INTEGER DEFAULT 1,
            cuota_actual INTEGER DEFAULT 1,
            monto_cuota REAL
        )`,
        `CREATE TABLE IF NOT EXISTS categorias_gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE
        )`,
        `CREATE TABLE IF NOT EXISTS gastos_comunes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            condominio_id INTEGER DEFAULT 1,
            periodo TEXT,
            concepto TEXT,
            monto_total REAL,
            fecha_emision TEXT,
            fecha_vencimiento TEXT,
            pagado INTEGER DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS gastos_unidad (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gasto_comun_id INTEGER,
            unidad_id INTEGER,
            monto_base REAL,
            monto_total REAL,
            pagado INTEGER DEFAULT 0,
            fecha_pago TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS espacios_comunes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            condominio_id INTEGER DEFAULT 1,
            nombre TEXT,
            descripcion TEXT,
            capacidad INTEGER,
            requiere_autorizacion INTEGER DEFAULT 0,
            cobro_activo INTEGER DEFAULT 0,
            horario_semana_inicio TEXT DEFAULT '10:00',
            horario_semana_fin TEXT DEFAULT '22:00',
            horario_festivo_inicio TEXT DEFAULT '10:00',
            horario_festivo_fin TEXT DEFAULT '02:00',
            costo_dia_semana REAL DEFAULT 0,
            costo_dia_festivo REAL DEFAULT 0,
            garantia REAL DEFAULT 0,
            tiene_juegos_inflables INTEGER DEFAULT 0,
            monto_extra_juegos REAL DEFAULT 0,
            dias_festivos TEXT DEFAULT ''
        )`,
        `CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            espacio_id INTEGER,
            unidad_id INTEGER,
            fecha TEXT,
            hora_inicio TEXT,
            hora_fin TEXT,
            motivo TEXT,
            estado TEXT DEFAULT 'pendiente',
            costo_total REAL DEFAULT 0,
            tiene_extra INTEGER DEFAULT 0,
            monto_extra REAL DEFAULT 0,
            garantia_aplicada INTEGER DEFAULT 0,
            garantia_cobrada INTEGER DEFAULT 0,
            check_out TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS multas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unidad_id INTEGER,
            fecha TEXT,
            motivo TEXT,
            monto REAL,
            periodo TEXT,
            pagado INTEGER DEFAULT 0,
            fecha_pago TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS bitacora (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT DEFAULT 'info',
            descripcion TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            conserje_nombre TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS encomiendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            residente_id INTEGER,
            remitente TEXT,
            descripcion TEXT,
            fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_retiro DATETIME,
            estado TEXT DEFAULT 'pendiente'
        )`,
        `CREATE TABLE IF NOT EXISTS visitas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitante_nombre TEXT,
            visitante_rut TEXT,
            visitante_telefono TEXT,
            motivo TEXT,
            unidad_destino_id INTEGER,
            placa_vehiculo TEXT,
            fecha_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
            fecha_salida DATETIME,
            estado TEXT DEFAULT 'activa'
        )`,
        `CREATE TABLE IF NOT EXISTS comunicados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT,
            contenido TEXT,
            autor TEXT,
            autor_rol TEXT DEFAULT 'admin',
            destino TEXT DEFAULT '{"tipo":"todos"}',
            adjunto_url TEXT,
            adjunto_nombre TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS equipos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT,
            ubicacion TEXT,
            tipo TEXT,
            frecuencia_dias INTEGER DEFAULT 30,
            proveedor TEXT,
            contacto TEXT,
            activo INTEGER DEFAULT 1
        )`,
        `CREATE TABLE IF NOT EXISTS mantenciones_programadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipo_id INTEGER,
            fecha_programada TEXT,
            descripcion TEXT DEFAULT 'Mantención programada',
            prioridad TEXT DEFAULT 'normal',
            estado TEXT DEFAULT 'pendiente',
            responsable TEXT,
            fecha_realizacion TEXT,
            observaciones TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS config_edificio (
            id INTEGER PRIMARY KEY DEFAULT 1,
            nombre_edificio TEXT,
            banco TEXT,
            tipo_cuenta TEXT,
            numero_cuenta TEXT,
            rut_empresa TEXT,
            email_contacto TEXT,
            telefono_contacto TEXT,
            instrucciones_pago TEXT
        )`
    ];

    const categorias = ['Mantenimiento','Limpieza','Servicios','Seguridad','Seguro','Administracion','Otro'];

    const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
    });

    try {
        for (const sql of tablas) await runAsync(sql);

        await runAsync(`INSERT OR IGNORE INTO config_edificio (id) VALUES (1)`);
        for (const cat of categorias) {
            await runAsync(`INSERT OR IGNORE INTO categorias_gastos (nombre) VALUES (?)`, [cat]);
        }

        const hash = await require('bcrypt').hash('admin123', 10);
        await runAsync(`INSERT OR IGNORE INTO usuarios (email, password, rol) VALUES (?, ?, ?)`, ['admin@kubox.com', hash, 'admin']);

        const hashC = await require('bcrypt').hash('conserje123', 10);
        await runAsync(`INSERT OR IGNORE INTO usuarios (email, password, rol) VALUES (?, ?, ?)`, ['conserje@kubox.com', hashC, 'conserje']);

        const hashJ = await require('bcrypt').hash('juan123', 10);
        await runAsync(`INSERT OR IGNORE INTO usuarios (email, password, rol) VALUES (?, ?, ?)`, ['juan@kubox.com', hashJ, 'residente']);

        res.json({
            success: true,
            message: 'Base de datos inicializada correctamente',
            tablas_creadas: tablas.length,
            usuarios: ['admin@kubox.com / admin123', 'conserje@kubox.com / conserje123', 'juan@kubox.com / juan123']
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// SEED - DATOS DE PRUEBA
// ============================================
app.get('/api/seed', async (req, res) => {
    if (req.query.key !== 'kubox-init-2026') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }

    const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) { err ? reject(err) : resolve(this); });
    });
    const getAsync = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });

    try {
        // ── Residentes ──
        const residentes = [
            { nombre: 'Juan Pérez', email: 'juan@kubox.com', telefono: '+56912345678' },
            { nombre: 'María González', email: 'maria@kubox.com', telefono: '+56923456789' },
            { nombre: 'Carlos Rodríguez', email: 'carlos@kubox.com', telefono: '+56934567890' },
            { nombre: 'Ana Martínez', email: 'ana@kubox.com', telefono: '+56945678901' },
            { nombre: 'Pedro Sánchez', email: 'pedro@kubox.com', telefono: '+56956789012' },
            { nombre: 'Laura Torres', email: 'laura@kubox.com', telefono: '+56967890123' }
        ];
        const resIds = [];
        for (const r of residentes) {
            const exist = await getAsync('SELECT id FROM residentes WHERE email = ?', [r.email]);
            if (exist) { resIds.push(exist.id); continue; }
            const result = await runAsync(
                'INSERT INTO residentes (nombre, email, telefono, condominio_id) VALUES (?, ?, ?, 1)',
                [r.nombre, r.email, r.telefono]
            );
            resIds.push(result.lastID);
        }

        // ── Usuarios residente ──
        const bcrypt = require('bcrypt');
        for (const r of residentes) {
            const hash = await bcrypt.hash('123456', 10);
            await runAsync(`INSERT OR IGNORE INTO usuarios (email, password, rol) VALUES (?, ?, 'residente')`, [r.email, hash]);
        }

        // ── Unidades ──
        const unidades = [
            { numero: '101', torre: 'A', tipo: 'departamento', metros_cuadrados: 65 },
            { numero: '102', torre: 'A', tipo: 'departamento', metros_cuadrados: 72 },
            { numero: '201', torre: 'A', tipo: 'departamento', metros_cuadrados: 65 },
            { numero: '202', torre: 'A', tipo: 'departamento', metros_cuadrados: 80 },
            { numero: '101', torre: 'B', tipo: 'departamento', metros_cuadrados: 55 },
            { numero: '102', torre: 'B', tipo: 'departamento', metros_cuadrados: 90 }
        ];
        const uniIds = [];
        for (let i = 0; i < unidades.length; i++) {
            const u = unidades[i];
            const exist = await getAsync('SELECT id FROM unidades WHERE numero = ? AND torre = ?', [u.numero, u.torre]);
            if (exist) { uniIds.push(exist.id); continue; }
            const result = await runAsync(
                'INSERT INTO unidades (numero, torre, tipo, metros_cuadrados, estacionamiento, bodega, residente_id) VALUES (?, ?, ?, ?, 1, 0, ?)',
                [u.numero, u.torre, u.tipo, u.metros_cuadrados, resIds[i]]
            );
            uniIds.push(result.lastID);
        }

        // ── Configuración edificio ──
        await runAsync(`UPDATE config_edificio SET
            nombre_edificio = 'Edificio Kubox',
            banco = 'Banco Estado',
            tipo_cuenta = 'Cuenta Corriente',
            numero_cuenta = '12345678',
            rut_empresa = '76.123.456-7',
            email_contacto = 'admin@kubox.com',
            telefono_contacto = '+56922334455',
            instrucciones_pago = 'Transferir al RUT indicado con glosa: Gasto Común + Número de Unidad'
            WHERE id = 1`);

        // ── Gastos ──
        const gastos = [
            { concepto: 'Mantención ascensor', monto: 180000, fecha: '2026-06-01', categoria: 'Mantenimiento', proveedor: 'TecnoLift' },
            { concepto: 'Limpieza mensual', monto: 95000, fecha: '2026-06-01', categoria: 'Limpieza', proveedor: 'LimpiaMax' },
            { concepto: 'Consumo agua común', monto: 42000, fecha: '2026-06-01', categoria: 'Servicios', proveedor: 'ESSAL' },
            { concepto: 'Energía áreas comunes', monto: 68000, fecha: '2026-06-01', categoria: 'Servicios', proveedor: 'CGE' },
            { concepto: 'Seguro edificio', monto: 320000, fecha: '2026-06-01', categoria: 'Seguro', proveedor: 'Mapfre', es_cuotas: 1, total_cuotas: 12, cuota_actual: 6, monto_cuota: 26667 },
            { concepto: 'Mantención jardines', monto: 55000, fecha: '2026-05-01', categoria: 'Mantenimiento', proveedor: 'Jardines del Valle' },
            { concepto: 'Portería y seguridad', monto: 210000, fecha: '2026-05-01', categoria: 'Seguridad', proveedor: 'SecurePro' }
        ];
        for (const g of gastos) {
            await runAsync(
                'INSERT INTO gastos (concepto, monto, fecha, categoria, proveedor, es_cuotas, total_cuotas, cuota_actual, monto_cuota) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [g.concepto, g.monto, g.fecha, g.categoria, g.proveedor, g.es_cuotas||0, g.total_cuotas||1, g.cuota_actual||1, g.monto_cuota||g.monto]
            );
        }

        // ── Espacios Comunes ──
        const espacios = [
            { nombre: 'Quincho', descripcion: 'Quincho con parrilla y zona de mesas', capacidad: 30, cobro_activo: 1, costo_dia_semana: 30000, costo_dia_festivo: 50000, garantia: 50000 },
            { nombre: 'Sala de Eventos', descripcion: 'Sala multipropósito para eventos', capacidad: 50, cobro_activo: 1, costo_dia_semana: 20000, costo_dia_festivo: 35000, garantia: 30000 },
            { nombre: 'Piscina', descripcion: 'Piscina temperada', capacidad: 20, cobro_activo: 0, requiere_autorizacion: 1 },
            { nombre: 'Gimnasio', descripcion: 'Sala de ejercicios equipada', capacidad: 10, cobro_activo: 0 }
        ];
        const espIds = [];
        for (const e of espacios) {
            const result = await runAsync(
                `INSERT INTO espacios_comunes (nombre, descripcion, capacidad, cobro_activo, requiere_autorizacion,
                 costo_dia_semana, costo_dia_festivo, garantia, condominio_id,
                 horario_semana_inicio, horario_semana_fin, horario_festivo_inicio, horario_festivo_fin)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, '10:00', '22:00', '10:00', '02:00')`,
                [e.nombre, e.descripcion, e.capacidad, e.cobro_activo||0, e.requiere_autorizacion||0,
                 e.costo_dia_semana||0, e.costo_dia_festivo||0, e.garantia||0]
            );
            espIds.push(result.lastID);
        }

        // ── Reservas ──
        await runAsync(`INSERT INTO reservas (espacio_id, unidad_id, fecha, hora_inicio, hora_fin, motivo, estado, costo_total) VALUES (?, ?, '2026-06-14', '14:00', '22:00', 'Cumpleaños', 'aprobada', 30000)`, [espIds[0], uniIds[0]]);
        await runAsync(`INSERT INTO reservas (espacio_id, unidad_id, fecha, hora_inicio, hora_fin, motivo, estado, costo_total) VALUES (?, ?, '2026-06-21', '10:00', '22:00', 'Reunión familiar', 'pendiente', 50000)`, [espIds[1], uniIds[2]]);
        await runAsync(`INSERT INTO reservas (espacio_id, unidad_id, fecha, hora_inicio, hora_fin, motivo, estado, costo_total) VALUES (?, ?, '2026-05-18', '12:00', '22:00', 'Aniversario', 'finalizada', 30000)`, [espIds[0], uniIds[1]]);

        // ── Multas ──
        await runAsync(`INSERT INTO multas (unidad_id, fecha, motivo, monto, periodo, pagado) VALUES (?, '2026-05-10', 'Ruidos molestos después de las 22:00', 50000, 'mayo 2026', 0)`, [uniIds[3]]);
        await runAsync(`INSERT INTO multas (unidad_id, fecha, motivo, monto, periodo, pagado, fecha_pago) VALUES (?, '2026-04-15', 'Mal uso del estacionamiento de visitas', 30000, 'abril 2026', 1, '2026-04-20')`, [uniIds[0]]);

        // ── Comunicados ──
        await runAsync(`INSERT INTO comunicados (titulo, contenido, autor, autor_rol, destino, fecha) VALUES (?, ?, 'admin@kubox.com', 'admin', '{"tipo":"todos"}', datetime('now', '-5 days'))`,
            ['Corte de agua programado', '<p>Se informa a todos los residentes que el día <strong>sábado 15 de junio</strong> habrá corte de agua entre las 09:00 y las 14:00 hrs por mantención de red.</p>']);
        await runAsync(`INSERT INTO comunicados (titulo, contenido, autor, autor_rol, destino, fecha) VALUES (?, ?, 'admin@kubox.com', 'admin', '{"tipo":"todos"}', datetime('now', '-15 days'))`,
            ['Reglamento uso piscina temporada 2026', '<p>Recordamos que el uso de la piscina requiere reserva previa. Horario: 10:00 - 20:00 hrs. Máximo 20 personas simultáneas.</p>']);

        // ── Bitácora ──
        await runAsync(`INSERT INTO bitacora (tipo, descripcion, conserje_nombre, fecha) VALUES ('info', 'Inicio de turno. Edificio en orden.', 'Conserje', datetime('now', '-1 hour'))`);
        await runAsync(`INSERT INTO bitacora (tipo, descripcion, conserje_nombre, fecha) VALUES ('alerta', 'Se detectó puerta del estacionamiento con falla en sensor. Se notificó a mantenimiento.', 'Conserje', datetime('now', '-3 hours'))`);
        await runAsync(`INSERT INTO bitacora (tipo, descripcion, conserje_nombre, fecha) VALUES ('info', 'Visita técnica ascensor Torre A completada sin novedades.', 'Conserje', datetime('now', '-1 day'))`);

        // ── Encomiendas ──
        await runAsync(`INSERT INTO encomiendas (residente_id, remitente, descripcion, estado, fecha_ingreso) VALUES (?, 'MercadoLibre', 'Caja mediana - Electrónico', 'pendiente', datetime('now', '-2 hours'))`, [resIds[0]]);
        await runAsync(`INSERT INTO encomiendas (residente_id, remitente, descripcion, estado, fecha_ingreso) VALUES (?, 'Falabella', 'Bolsa ropa', 'pendiente', datetime('now', '-1 day'))`, [resIds[2]]);
        await runAsync(`INSERT INTO encomiendas (residente_id, remitente, descripcion, estado, fecha_ingreso, fecha_retiro) VALUES (?, 'Amazon', 'Caja grande', 'entregado', datetime('now', '-3 days'), datetime('now', '-2 days'))`, [resIds[1]]);

        // ── Visitas ──
        await runAsync(`INSERT INTO visitas (visitante_nombre, visitante_rut, motivo, unidad_destino_id, estado, fecha_entrada) VALUES ('Roberto Díaz', '15.234.567-8', 'Visita familiar', ?, 'activa', datetime('now', '-30 minutes'))`, [uniIds[0]]);
        await runAsync(`INSERT INTO visitas (visitante_nombre, motivo, unidad_destino_id, estado, fecha_entrada, fecha_salida) VALUES ('Técnico Gas', 'Revisión instalación', ?, 'finalizada', datetime('now', '-2 hours'), datetime('now', '-1 hour'))`, [uniIds[3]]);

        // ── Equipos y Mantenciones ──
        const eq1 = await runAsync(`INSERT INTO equipos (nombre, ubicacion, tipo, frecuencia_dias, proveedor, contacto) VALUES ('Ascensor Torre A', 'Hall principal', 'Ascensor', 30, 'TecnoLift', '+56911111111')`);
        const eq2 = await runAsync(`INSERT INTO equipos (nombre, ubicacion, tipo, frecuencia_dias, proveedor, contacto) VALUES ('Bomba de agua', 'Sala técnica subsuelo', 'Bombas', 90, 'HidroTec', '+56922222222')`);
        const eq3 = await runAsync(`INSERT INTO equipos (nombre, ubicacion, tipo, frecuencia_dias, proveedor, contacto) VALUES ('Portón automático', 'Acceso vehicular', 'Portón', 60, 'AutoGate', '+56933333333')`);
        await runAsync(`INSERT INTO mantenciones_programadas (equipo_id, fecha_programada, descripcion, prioridad, estado) VALUES (?, '2026-06-30', 'Mantención mensual ascensor', 'alta', 'pendiente')`, [eq1.lastID]);
        await runAsync(`INSERT INTO mantenciones_programadas (equipo_id, fecha_programada, descripcion, prioridad, estado, fecha_realizacion, observaciones) VALUES (?, '2026-05-15', 'Revisión bomba', 'normal', 'completada', '2026-05-15', 'Sin novedades, presión correcta.')`, [eq2.lastID]);
        await runAsync(`INSERT INTO mantenciones_programadas (equipo_id, fecha_programada, descripcion, prioridad, estado) VALUES (?, '2026-07-15', 'Lubricación y ajuste portón', 'normal', 'pendiente')`, [eq3.lastID]);

        // ── Gastos Comunes por período (junio y mayo) ──
        // Metros cuadrados por unidad: 65, 72, 65, 80, 55, 90 = 427 m² total
        const periodos = [
            { periodo: 'junio 2026', totalGastos: 585000, fecha_emision: '2026-06-01', fecha_vencimiento: '2026-06-10' },
            { periodo: 'mayo 2026', totalGastos: 560000, fecha_emision: '2026-05-01', fecha_vencimiento: '2026-05-10' }
        ];
        for (const p of periodos) {
            const gcResult = await runAsync(
                `INSERT INTO gastos_comunes (condominio_id, periodo, concepto, monto_total, fecha_emision, fecha_vencimiento, pagado) VALUES (1, ?, 'Gastos Comunes', ?, ?, ?, 0)`,
                [p.periodo, p.totalGastos, p.fecha_emision, p.fecha_vencimiento]
            );
            const gcId = gcResult.lastID;
            const totalMetros = 427;
            for (let i = 0; i < uniIds.length; i++) {
                const metros = [65, 72, 65, 80, 55, 90][i];
                const monto = Math.round(p.totalGastos * metros / totalMetros);
                const pagado = (p.periodo === 'mayo 2026' && i < 4) ? 1 : 0;
                await runAsync(
                    `INSERT INTO gastos_unidad (gasto_comun_id, unidad_id, monto_base, monto_total, pagado) VALUES (?, ?, ?, ?, ?)`,
                    [gcId, uniIds[i], monto, monto, pagado]
                );
            }
        }

        res.json({
            success: true,
            message: 'Datos de prueba cargados correctamente',
            resumen: {
                residentes: residentes.length,
                unidades: unidades.length,
                gastos: gastos.length,
                espacios: espacios.length,
                reservas: 3, multas: 2, comunicados: 2,
                bitacora: 3, encomiendas: 3, visitas: 2, equipos: 3,
                gastos_comunes_periodos: 2, gastos_unidad: 12
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// ============================================
// MOROSOS DETALLE (para ConserjeDashboard)
// ============================================
app.get('/api/morosos-detalle', (req, res) => {
    const sql = `
        SELECT r.id, r.nombre, r.email, u.numero as unidad_numero,
               SUM(gu.monto_total) as deuda_total,
               COUNT(DISTINCT gc.periodo) as meses_moroso
        FROM residentes r
        JOIN unidades u ON u.residente_id = r.id
        JOIN gastos_unidad gu ON gu.unidad_id = u.id
        JOIN gastos_comunes gc ON gc.id = gu.gasto_comun_id
        WHERE gu.pagado = 0
        GROUP BY r.id, r.nombre, r.email, u.numero
        ORDER BY deuda_total DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// ============================================
// COLUMNAS FALTANTES EN COMUNICADOS
// ============================================
db.run('ALTER TABLE comunicados ADD COLUMN autor_rol TEXT DEFAULT "admin"', (e) => {});
db.run('ALTER TABLE comunicados ADD COLUMN adjunto_url TEXT', (e) => {});
db.run('ALTER TABLE comunicados ADD COLUMN adjunto_nombre TEXT', (e) => {});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Backend Kubox corriendo en http://localhost:${PORT}`);
});