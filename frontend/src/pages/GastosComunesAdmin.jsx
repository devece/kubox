import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Users, Plus, CheckCircle, XCircle, Trash2, Calendar } from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

function GastosComunesAdmin() {
  const [gastos, setGastos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [periodoActual, setPeriodoActual] = useState('');
  const [totalGastosReales, setTotalGastosReales] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [mostrarLimpiarPeriodo, setMostrarLimpiarPeriodo] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    if (periodoActual) {
      cargarGastosPorPeriodo(periodoActual);
    }
  }, [periodoActual]);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      await Promise.all([
        cargarPeriodos(),
        cargarUnidades(),
        cargarTotalGastos()
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarPeriodos = async () => {
    try {
      const res = await axios.get(API + '/gastos-periodos');
      setPeriodos(res.data || []);
      if (res.data && res.data.length > 0) {
        setPeriodoActual(res.data[0]);
      }
    } catch (error) {
      console.error('Error cargando periodos:', error);
      setPeriodos([]);
    }
  };

  const cargarUnidades = async () => {
    try {
      const res = await axios.get(API + '/unidades');
      setUnidades(res.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cargarGastosPorPeriodo = async (periodo) => {
    try {
      const res = await axios.get(API + '/gastos-comunes/' + encodeURIComponent(periodo));
      console.log('Gastos cargados:', res.data);
      setGastos(res.data || []);
    } catch (error) {
      console.error('Error:', error);
      setGastos([]);
    }
  };

  const cargarTotalGastos = async () => {
    try {
      const res = await axios.get(API + '/gastos');
      const total = res.data.reduce((sum, g) => sum + (g.monto_cuota || g.monto || 0), 0);
      setTotalGastosReales(total);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generarGastosComunes = async () => {
    const input = prompt('Ingrese el periodo (ej: Julio 2026):');
    if (!input) return;
    
    const partes = input.trim().split(' ');
    if (partes.length < 2) {
      alert('Formato inválido. Use: "Mes Año" (ej: Julio 2026)');
      return;
    }
    
    const mesTexto = partes[0];
    const anio = parseInt(partes[1]);
    
    const meses = {
      'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
      'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12,
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
      'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    
    const mesNumero = meses[mesTexto];
    if (!mesNumero) {
      alert('Mes inválido');
      return;
    }
    
    if (isNaN(anio) || anio < 2000 || anio > 2100) {
      alert('Año inválido');
      return;
    }
    
    const periodo = mesTexto + ' ' + anio;
    
    setGenerando(true);
    try {
      const response = await axios.post(API + '/generar-gastos-comunes', { periodo, mes: mesNumero, anio });
      alert(response.data.message);
      await cargarPeriodos();
      setPeriodoActual(periodo);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setGenerando(false);
    }
  };

  const limpiarCobros = async () => {
    if (confirm('¿Eliminar TODOS los cobros por unidad?')) {
      await axios.delete(API + '/limpiar-gastos-comunes');
      await cargarPeriodos();
      setGastos([]);
      alert('Cobros por unidad eliminados');
    }
  };

  const limpiarPorPeriodo = async (periodo) => {
    if (confirm('¿Eliminar cobros del periodo ' + periodo + '?')) {
      await axios.delete(API + '/limpiar-gastos-periodo/' + encodeURIComponent(periodo));
      await cargarPeriodos();
      if (periodoActual === periodo) {
        setGastos([]);
      }
      alert('Cobros del periodo ' + periodo + ' eliminados');
      setMostrarLimpiarPeriodo(false);
    }
  };

  const registrarPago = async (gastoId) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (confirm('¿Registrar pago?')) {
      await axios.post(API + '/pagar-gasto-unidad', { gasto_unidad_id: gastoId, fecha_pago: fecha });
      await cargarGastosPorPeriodo(periodoActual);
      alert('✅ Pago registrado');
    }
  };

  const totalPendiente = gastos.reduce((sum, g) => sum + (g.monto_total || 0), 0);
  const totalPagado = gastos.filter(g => g.pagado === 1).reduce((sum, g) => sum + (g.monto_total || 0), 0);

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gastos Comunes</h1>
          <p className="text-white/70">Gestión de gastos y cobros a residentes</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generarGastosComunes} disabled={generando} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2 disabled:opacity-50">
            <Plus size={20} /> {generando ? 'Generando...' : 'Generar Cobros'}
          </button>
          <div className="relative">
            <button onClick={() => setMostrarLimpiarPeriodo(!mostrarLimpiarPeriodo)} className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
              <Trash2 size={20} /> Limpiar por Periodo
            </button>
            {mostrarLimpiarPeriodo && periodos.length > 0 && (
              <div className="absolute right-0 mt-2 bg-gray-800 rounded-xl shadow-lg z-10 w-48">
                {periodos.map(p => (
                  <button key={p} onClick={() => limpiarPorPeriodo(p)} className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-xl text-sm">
                    Eliminar {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={limpiarCobros} className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Trash2 size={20} /> Limpiar Todo
          </button>
        </div>
      </div>

      {/* Selector de Periodo */}
      <div className="mb-6">
        <label className="text-white/70 text-sm block mb-2">Seleccionar Periodo:</label>
        <div className="flex gap-2 flex-wrap">
          {periodos.map(p => (
            <button
              key={p}
              onClick={() => setPeriodoActual(p)}
              className={'px-4 py-2 rounded-xl transition flex items-center gap-2 ' + (periodoActual === p ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white')}
            >
              <Calendar size={16} /> {p}
            </button>
          ))}
        </div>
        {periodos.length === 0 && (
          <div className="text-white/40 text-sm">No hay periodos generados. Usa "Generar Cobros" para crear uno.</div>
        )}
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <DollarSign className="w-8 h-8 text-white mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Total Gastos</h3>
          <p className="text-2xl font-bold text-white mt-1">${totalGastosReales.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Total Cobrado</h3>
          <p className="text-2xl font-bold text-white mt-1">${totalPagado.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <XCircle className="w-8 h-8 text-red-400 mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Pendiente</h3>
          <p className="text-2xl font-bold text-white mt-1">${totalPendiente.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <Users className="w-8 h-8 text-white mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Unidades</h3>
          <p className="text-2xl font-bold text-white mt-1">{unidades.length}</p>
        </div>
      </div>

      {/* Tabla de cobros */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Unidad</th>
                <th className="p-4 text-left">Periodo</th>
                <th className="p-4 text-left">Monto</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {gastos.map(g => (
                <tr key={g.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4 font-medium">Unidad {g.unidad_numero || '-'}</td>
                  <td className="p-4">{g.periodo || '-'}</td>
                  <td className="p-4 text-green-400 font-semibold">${Number(g.monto_total || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={g.pagado === 1 ? 'px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300' : 'px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300'}>
                      {g.pagado === 1 ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="p-4">
                    {g.pagado !== 1 && (
                      <button onClick={() => registrarPago(g.id)} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/40 transition text-sm">
                        Registrar Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            {gastos.length === 0 && (
              <div className="text-center py-12 text-white/40">No hay cobros para este período</div>
            )}
          </div>
        </div>
      </div>
  );
}

export default GastosComunesAdmin;