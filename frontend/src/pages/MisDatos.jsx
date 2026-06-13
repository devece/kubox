import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Home, Save } from 'lucide-react';

const API = 'http://localhost:3001/api';

function MisDatos({ residenteEmail }) {
  const [residente, setResidente] = useState(null);
  const [unidad, setUnidad] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '' });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resResidente = await axios.get(API + '/residentes/email/' + residenteEmail);
      setResidente(resResidente.data);
      setFormData({ nombre: resResidente.data.nombre, telefono: resResidente.data.telefono || '' });
      
      if (resResidente.data) {
        const resUnidad = await axios.get(API + '/unidades/residente/' + resResidente.data.id);
        setUnidad(resUnidad.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarCambios = async () => {
    try {
      await axios.put(API + '/residentes/' + residente.id, formData);
      setEditando(false);
      cargarDatos();
      alert('✅ Datos actualizados correctamente');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Datos</h1>
        <p className="text-white/70">Información personal y de tu unidad</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <User size={24} className="text-white/60" />
            <div className="flex-1">
              <label className="text-white/50 text-sm">Nombre completo</label>
              {editando ? (
                <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{residente?.nombre}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Mail size={24} className="text-white/60" />
            <div className="flex-1">
              <label className="text-white/50 text-sm">Correo electrónico</label>
              <p className="text-white text-lg">{residente?.email}</p>
              <p className="text-white/30 text-xs">No se puede modificar</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <Phone size={24} className="text-white/60" />
            <div className="flex-1">
              <label className="text-white/50 text-sm">Teléfono</label>
              {editando ? (
                <input type="text" className="w-full mt-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{residente?.telefono || 'No registrado'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Home size={24} className="text-white/60" />
            <div className="flex-1">
              <label className="text-white/50 text-sm">Unidad</label>
              <p className="text-white text-lg">Unidad {unidad?.numero || 'No asignada'} - Torre {unidad?.torre || 'N/A'}</p>
              <p className="text-white/30 text-xs">Contacta al administrador para cambios</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            {editando ? (
              <div className="flex gap-3">
                <button onClick={() => setEditando(false)} className="px-4 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/40 transition">Cancelar</button>
                <button onClick={guardarCambios} className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/40 transition flex items-center gap-2">
                  <Save size={18} /> Guardar
                </button>
              </div>
            ) : (
              <button onClick={() => setEditando(true)} className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40 transition">Editar Datos</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MisDatos;
