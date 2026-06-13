const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("kubox.db");

// Obtener gastos en cuotas que aún no han generado todas sus cuotas
db.all(`SELECT gc.*, gc.total_cuotas, gc.cuota_actual, gc.id as gasto_id 
        FROM gastos_comunes gc 
        WHERE gc.es_cuotas = 1 
        AND gc.cuota_actual < gc.total_cuotas 
        AND gc.cuotas_generadas = 0
        AND date(gc.fecha_emision) <= date("now")`, 
    (err, gastosPendientes) => {
        if (err) {
            console.log("Error:", err.message);
            return db.close();
        }
        
        if (gastosPendientes.length === 0) {
            console.log("No hay cuotas pendientes por generar");
            return db.close();
        }
        
        // Obtener unidades
        db.all("SELECT id FROM unidades", (err, unidades) => {
            if (err || !unidades.length) {
                console.log("No hay unidades");
                return db.close();
            }
            
            let procesados = 0;
            
            gastosPendientes.forEach(gasto => {
                const nuevaCuota = gasto.cuota_actual + 1;
                const montoCuota = Math.round(gasto.monto_total / gasto.total_cuotas);
                
                // Generar nuevo período (mes siguiente)
                const fechaActual = new Date();
                const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                const mesActual = meses[fechaActual.getMonth()];
                const añoActual = fechaActual.getFullYear();
                const nuevoPeriodo = mesActual + " " + añoActual;
                
                // Insertar nuevo gasto para la siguiente cuota
                const sql = `INSERT INTO gastos_comunes 
                        (condominio_id, periodo, concepto, monto_total, fecha_emision, fecha_vencimiento, pagado, es_cuotas, total_cuotas, cuota_actual, monto_cuota, cuotas_generadas) 
                        VALUES (1, ?, ?, ?, date("now"), date("now", "+30 days"), 0, 1, ?, ?, ?, 1)`;
                
                db.run(sql, [nuevoPeriodo, gasto.concepto + " (Cuota " + nuevaCuota + "/" + gasto.total_cuotas + ")", gasto.monto_total, gasto.total_cuotas, nuevaCuota, montoCuota],
                    function(err) {
                        if (err) {
                            console.log("Error insertando cuota:", err.message);
                        } else {
                            const nuevoGastoId = this.lastID;
                            
                            // Insertar cobros por unidad
                            unidades.forEach(u => {
                                db.run("INSERT INTO gastos_unidad (gasto_comun_id, unidad_id, monto_base, monto_total, pagado) VALUES (?, ?, ?, ?, 0)",
                                    [nuevoGastoId, u.id, montoCuota, montoCuota]);
                            });
                            
                            console.log("✓ Generada cuota " + nuevaCuota + "/" + gasto.total_cuotas + " para: " + gasto.concepto);
                        }
                        
                        // Marcar gasto original como procesado
                        db.run("UPDATE gastos_comunes SET cuotas_generadas = 1 WHERE id = ?", [gasto.gasto_id]);
                        
                        procesados++;
                        if (procesados === gastosPendientes.length) {
                            console.log("");
                            console.log("✅ Cuotas generadas correctamente");
                            db.close();
                        }
                    }
                );
            });
        });
    }
);