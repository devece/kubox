import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Calendar, User } from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

function ComunicadosResidente({ residenteEmail }) {
  const [comunicados, setComunicados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarComunicados();
  }, []);

  const cargarComunicados = async () => {
    try {
      const res = await axios.get(API + '/comunicados');
      setComunicados(res.data || []);
    } catch (error) {
      console.error('Error cargando comunicados:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando comunicados...</div>;
  }

  if (comunicados.length === 0) {
    return <div className="text-white text-center py-12">No hay comunicados disponibles</div>;
  }

  const limpiarHTML = (texto) => {
    if (!texto) return '';
    return texto.replace(/<[^>]*>/g, '');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Comunicados</h1>
        <p className="text-white/70">Avisos importantes del edificio</p>
      </div>

      <div className="space-y-4">
        {comunicados.map(c => (
          <div key={c.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-white">{c.titulo}</h3>
              <span className="text-white/40 text-sm flex items-center gap-1">
                <Calendar size={14} /> {c.fecha?.split(' ')[0] || 'Fecha no disponible'}
              </span>
            </div>
            <div className="text-white/70 mb-3">
              {limpiarHTML(c.contenido)}
            </div>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <User size={14} />
              <span>Publicado por: {c.autor || 'Administrador'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComunicadosResidente;
