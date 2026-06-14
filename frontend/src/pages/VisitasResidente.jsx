import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Clock, UserCheck } from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

function VisitasResidente({ residenteEmail }) {
  const [visitas, setVisitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarVisitas();
  }, []);

  const cargarVisitas = async () => {
    try {
      const resResidente = await axios.get(API + '/residentes/email/' + residenteEmail);
      if (!resResidente.data) return;
      
      const resUnidad = await axios.get(API + '/unidades/residente/' + resResidente.data.id);
      if (!resUnidad.data) return;
      
      const resVisitas = await axios.get(API + '/visitas/unidad/' + resUnidad.data.id);
      setVisitas(resVisitas.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'activa': return 'bg-green-500/20 text-green-300';
      case 'finalizada': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando tus visitas...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Visitas</h1>
        <p className="text-white/70">Registro de visitas a tu unidad</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Visitante</th>
                <th className="p-4 text-left">RUT</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Hora Entrada</th>
                <th className="p-4 text-left">Hora Salida</th>
                <th className="p-4 text-left">Motivo</th>
                <th className="p-4 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visitas.map(v => (
                <tr key={v.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4 font-medium">{v.visitante_nombre}</td>
                  <td className="p-4">{v.visitante_rut || '-'}</td>
                  <td className="p-4">{v.fecha_entrada?.split('T')[0] || '-'}</td>
                  <td className="p-4">{v.hora_entrada || '-'}</td>
                  <td className="p-4">{v.hora_salida || 'Aún activa'}</td>
                  <td className="p-4">{v.motivo || '-'}</td>
                  <td className="p-4">
                    <span className={'px-2 py-1 rounded-full text-xs ' + getEstadoColor(v.estado)}>
                      {v.estado === 'activa' ? '🟢 Activa' : '⚫ Finalizada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visitas.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay visitas registradas para tu unidad</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VisitasResidente;
