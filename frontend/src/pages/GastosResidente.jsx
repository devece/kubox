import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

function GastosComunesResidente({ residenteEmail }) {
  const [gastos, setGastos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagado, setPagado] = useState(0);
  const [pendiente, setPendiente] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!residenteEmail) {
      setError('No se recibió email del residente');
      setCargando(false);
      return;
    }
    cargarGastos();
  }, [residenteEmail]);

  const cargarGastos = async () => {
    try {
      console.log('Buscando residente con email:', residenteEmail);
      
      // 1. Obtener el residente por email
      const resResidente = await axios.get(`${API}/residentes/email/${residenteEmail}`);
      console.log('Residente encontrado:', resResidente.data);
      
      if (!resResidente.data) {
        setError('Residente no encontrado');
        setCargando(false);
        return;
      }
      
      // 2. Obtener la unidad del residente
      const resUnidad = await axios.get(`${API}/unidades/residente/${resResidente.data.id}`);
      console.log('Unidad encontrada:', resUnidad.data);
      
      if (!resUnidad.data) {
        setError('Unidad no encontrada para este residente');
        setCargando(false);
        return;
      }
      
      // 3. Obtener los gastos de esa unidad
      const resGastos = await axios.get(`${API}/gastos-comunes/unidad/${resUnidad.data.id}`);
      console.log('Gastos encontrados:', resGastos.data);
      
      const datos = resGastos.data || [];
      setGastos(datos);
      
      // Calcular totales
      let sumaTotal = 0;
      let sumaPagado = 0;
      
      datos.forEach(g => {
        const monto = Number(g.monto_total) || 0;
        sumaTotal += monto;
        if (g.pagado === 1 || g.pagado === true) {
          sumaPagado += monto;
        }
      });
      
      setTotal(sumaTotal);
      setPagado(sumaPagado);
      setPendiente(sumaTotal - sumaPagado);
      
    } catch (err) {
      console.error('Error cargando gastos:', err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando gastos...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center py-12">Error: {error}</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gastos Comunes</h1>
        <p className="text-white/70">Detalle de tus gastos comunes por período</p>
      </div>

      {/* Tarjetas de totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="text-2xl font-bold text-white mb-2">Total Gastos</div>
          <div className="text-3xl font-bold text-green-400">${total.toLocaleString()}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="text-2xl font-bold text-white mb-2">Total Pagado</div>
          <div className="text-3xl font-bold text-green-400">${pagado.toLocaleString()}</div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="text-2xl font-bold text-white mb-2">Pendiente</div>
          <div className="text-3xl font-bold text-red-400">${pendiente.toLocaleString()}</div>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Período</th>
                <th className="p-4 text-left">Concepto</th>
                <th className="p-4 text-left">Monto</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {gastos.map(g => (
                <tr key={g.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4">{g.periodo || '-'}</td>
                  <td className="p-4">{g.concepto || 'Gastos Comunes'}</td>
                  <td className="p-4 font-semibold text-green-400">${Number(g.monto_total || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={g.pagado === 1 ? 'px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300' : 'px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300'}>
                      {g.pagado === 1 ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-white/60">{g.fecha_vencimiento || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {gastos.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay gastos registrados para tu unidad</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GastosComunesResidente;