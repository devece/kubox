import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Calendar, DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import GastosReales from './GastosReales';

const API = 'http://localhost:3001/api';

export default function Gastos({ user }) {
  const [config, setConfig] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [detalleActual, setDetalleActual] = useState(null);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [formConfig, setFormConfig] = useState({});
  const [nuevoGasto, setNuevoGasto] = useState({ periodo: '', fecha_vencimiento: '' });
  const [periodoActual, setPeriodoActual] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarConfig();
    cargarGastos();
  }, []);

  const cargarConfig = async () => {
    const res = await axios.get(`${API}/config-gastos`);
    setConfig(res.data);
    setFormConfig(res.data);
  };

  const cargarGastos = async () => {
    const res = await axios.get(`${API}/gastos`);
    setGastos(res.data);
  };

  const cargarDetalle = async (id) => {
    const res = await axios.get(`${API}/gastos-detalle/${id}`);
    setDetalleActual(res.data);
  };

  const guardarConfig = async () => {
    try {
      await axios.put(`${API}/config-gastos`, {
        valor_metro_cuadrado: parseInt(formConfig.valor_metro_cuadrado),
        porcentaje_fondo_reserva: parseInt(formConfig.porcentaje_fondo_reserva),
        interes_mora_mensual: parseInt(formConfig.interes_mora_mensual),
        dias_gracia: parseInt(formConfig.dias_gracia)
      });
      alert('Configuración guardada');
      cargarConfig();
      setMostrarConfig(false);
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const generarGastoDesdeReales = async () => {
    if (!nuevoGasto.periodo || !nuevoGasto.fecha_vencimiento) {
      alert('Completa periodo y fecha de vencimiento');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/generar-gasto-desde-reales`, nuevoGasto);
      alert(`✅ Gasto generado: Total $${res.data.monto_total.toLocaleString()} (${res.data.unidades} unidades)`);
      cargarGastos();
      setNuevoGasto({ periodo: '', fecha_vencimiento: '' });
      setPeriodoActual('');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const registrarPago = async (gastoUnidadId) => {
    const fecha = new Date().toISOString().split('T')[0];
    await axios.post(`${API}/pagar-gasto`, { gasto_unidad_id: gastoUnidadId, fecha_pago: fecha });
    if (detalleActual) {
      cargarDetalle(detalleActual[0]?.gasto_comun_id);
    }
    cargarGastos();
    alert('Pago registrado');
  };

  const esAdmin = user?.rol === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gastos Comunes</h1>
        {esAdmin && (
          <button onClick={() => setMostrarConfig(true)} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            <Settings size={18} /> Configuración
          </button>
        )}
      </div>

      {config && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Configuración actual</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600">Valor m²:</span> <span className="font-bold">${config.valor_metro_cuadrado}</span></div>
            <div><span className="text-gray-600">Fondo reserva:</span> <span className="font-bold">{config.porcentaje_fondo_reserva}%</span></div>
            <div><span className="text-gray-600">Interés mora:</span> <span className="font-bold">{config.interes_mora_mensual}% mensual</span></div>
            <div><span className="text-gray-600">Días gracia:</span> <span className="font-bold">{config.dias_gracia} días</span></div>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: INGRESAR GASTOS REALES */}
      {esAdmin && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-800">📝 Paso 1: Ingresar gastos reales del periodo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seleccionar periodo (AAAA-MM):</label>
              <input 
                type="month" 
                className="p-2 border rounded w-full" 
                value={periodoActual} 
                onChange={e => setPeriodoActual(e.target.value)} 
              />
            </div>
          </div>
          {periodoActual && (
            <GastosReales periodo={periodoActual} onGastoAgregado={() => cargarGastos()} />
          )}
        </div>
      )}

      {/* SECCIÓN 2: GENERAR GASTO MENSUAL */}
      {esAdmin && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-800">🎯 Paso 2: Generar cobro a residentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              type="month" 
              className="p-2 border rounded" 
              placeholder="Periodo (2025-01)" 
              value={nuevoGasto.periodo} 
              onChange={e => setNuevoGasto({...nuevoGasto, periodo: e.target.value})} 
            />
            <input 
              type="date" 
              className="p-2 border rounded" 
              placeholder="Fecha vencimiento" 
              value={nuevoGasto.fecha_vencimiento} 
              onChange={e => setNuevoGasto({...nuevoGasto, fecha_vencimiento: e.target.value})} 
            />
          </div>
          <button 
            onClick={generarGastoDesdeReales} 
            disabled={loading} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {loading ? 'Generando...' : '💰 Generar gasto del mes desde gastos reales'}
          </button>
        </div>
      )}

      {/* SECCIÓN 3: HISTORIAL DE GASTOS */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">📋 Historial de gastos generados</h2>
        <div className="divide-y">
          {gastos.map(g => (
            <div key={g.id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => cargarDetalle(g.id)}>
                <div>
                  <span className="font-bold text-lg">Periodo {g.periodo}</span>
                  <div className="text-sm text-gray-500">Emitido: {g.fecha_emision} | Vence: {g.fecha_vencimiento}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${g.monto_total?.toLocaleString()}</div>
                  <div className="text-sm text-red-500">{g.morosos} morosos</div>
                </div>
              </div>
              {detalleActual && detalleActual[0]?.gasto_comun_id === g.id && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-semibold mb-2">Detalle por unidad</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left">Unidad</th>
                          <th className="p-2 text-left">Residente</th>
                          <th className="p-2 text-right">Base</th>
                          <th className="p-2 text-right">Fondo</th>
                          <th className="p-2 text-right">Total</th>
                          <th className="p-2 text-center">Estado</th>
                          <th className="p-2 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleActual.map(d => (
                          <tr key={d.id} className="border-t">
                            <td className="p-2">{d.unidad_numero} (<span className="text-xs">{d.metros_cuadrados || 50}m²</span>)</td>
                            <td className="p-2">{d.residente_nombre || 'Sin residente'}</td>
                            <td className="p-2 text-right">${d.monto_base?.toLocaleString()}</td>
                            <td className="p-2 text-right">${d.fondo_reserva?.toLocaleString()}</td>
                            <td className="p-2 text-right font-bold">${d.monto_total?.toLocaleString()}</td>
                            <td className="p-2 text-center">
                              {d.pagado ? <span className="text-green-600">✅ Pagado</span> : <span className="text-red-500">⚠️ Debe</span>}
                              {d.interes_mora > 0 && <span className="text-orange-500 text-xs block">+${d.interes_mora} mora</span>}
                            </td>
                            <td className="p-2 text-center">
                              {!d.pagado && d.residente_id && esAdmin && (
                                <button onClick={() => registrarPago(d.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600">
                                  Pagar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
          {gastos.length === 0 && <div className="p-8 text-center text-gray-500">No hay gastos generados aún</div>}
        </div>
      </div>

      {/* Modal Configuración */}
      {mostrarConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Configurar Gastos</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium">Valor por m² ($)</label><input type="number" className="w-full p-2 border rounded" value={formConfig.valor_metro_cuadrado} onChange={e => setFormConfig({...formConfig, valor_metro_cuadrado: e.target.value})} /></div>
              <div><label className="block text-sm font-medium">% Fondo reserva</label><input type="number" className="w-full p-2 border rounded" value={formConfig.porcentaje_fondo_reserva} onChange={e => setFormConfig({...formConfig, porcentaje_fondo_reserva: e.target.value})} /></div>
              <div><label className="block text-sm font-medium">% Interés mora mensual</label><input type="number" className="w-full p-2 border rounded" value={formConfig.interes_mora_mensual} onChange={e => setFormConfig({...formConfig, interes_mora_mensual: e.target.value})} /></div>
              <div><label className="block text-sm font-medium">Días de gracia</label><input type="number" className="w-full p-2 border rounded" value={formConfig.dias_gracia} onChange={e => setFormConfig({...formConfig, dias_gracia: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setMostrarConfig(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
              <button onClick={guardarConfig} className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}