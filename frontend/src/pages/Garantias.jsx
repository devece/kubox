import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const API = 'http://localhost:3001/api';

function Garantias({ user }) {
  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const esAdmin = user?.rol === 'admin';
  const esConserje = user?.rol === 'conserje';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [reservasRes, espaciosRes, unidadesRes] = await Promise.all([
        axios.get(API + '/reservas'),
        axios.get(API + '/espacios'),
        axios.get(API + '/unidades')
      ]);
      setReservas(reservasRes.data);
      setEspacios(espaciosRes.data);
      setUnidades(unidadesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const aplicarGarantia = async (reservaId, aplicar) => {
    if (!esAdmin) return alert('Solo administradores pueden aplicar garantías');
    try {
      await axios.post(API + '/aplicar-garantia', { reserva_id: reservaId, aplicar });
      cargarDatos();
      alert(aplicar ? '✅ Garantía aplicada' : '❌ Garantía no aplicada');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getEspacioNombre = (id) => {
    const espacio = espacios.find(e => e.id === id);
    return espacio?.nombre || 'Desconocido';
  };

  const getUnidadNumero = (id) => {
    const unidad = unidades.find(u => u.id === id);
    return unidad?.numero || 'N/A';
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-300';
      case 'aprobada': return 'bg-green-500/20 text-green-300';
      case 'rechazada': return 'bg-red-500/20 text-red-300';
      case 'finalizada': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Garantías</h1>
        <p className="text-white/70">Gestión de garantías por uso de espacios comunes</p>
        {!esAdmin && <p className="text-yellow-400 text-sm mt-2">⚠️ Solo administradores pueden aplicar garantías</p>}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Reserva</th>
                <th className="p-4 text-left">Unidad</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Costo</th>
                <th className="p-4 text-left">Garantía</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reservas.filter(r => r.estado === 'finalizada').map(r => (
                <tr key={r.id} className="text-white/80">
                  <td className="p-4">{getEspacioNombre(r.espacio_id)}</td>
                  <td className="p-4">Unidad {getUnidadNumero(r.unidad_id)}</td>
                  <td className="p-4">{r.fecha}</td>
                  <td className="p-4"><span className={'px-2 py-1 rounded-full text-xs ' + getEstadoColor(r.estado)}>{r.estado}</span></td>
                  <td className="p-4 text-green-400 font-semibold">${(r.costo_total || 0).toLocaleString()}</td>
                  <td className="p-4">
                    {r.garantia_aplicada ? 
                      <span className="text-red-400 flex items-center gap-1"><XCircle size={16} /> Aplicada</span> : 
                      <span className="text-green-400 flex items-center gap-1"><CheckCircle size={16} /> No aplicada</span>}
                  </td>
                  <td className="p-4">
                    {esAdmin && r.garantia_aplicada !== 1 && (
                      <div className="flex gap-2">
                        <button onClick={() => aplicarGarantia(r.id, true)} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition text-sm flex items-center gap-1">
                          <AlertTriangle size={14} /> Aplicar Garantía
                        </button>
                      </div>
                    )}
                    {esAdmin && r.garantia_aplicada === 1 && (
                      <span className="text-red-400 text-sm">Garantía cobrada</span>
                    )}
                  </td>
                </tr>
              ))}
              {reservas.filter(r => r.estado === 'finalizada').length === 0 && (
                <tr><td colSpan="7" className="text-center py-12 text-white/40">No hay reservas finalizadas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Garantias;
