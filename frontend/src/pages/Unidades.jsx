import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, Plus, Trash2, Edit, Eye } from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

function Unidades({ soloLectura = false }) {
  const [unidades, setUnidades] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    torre: '',
    tipo: 'depto',
    metros_cuadrados: '',
    estacionamiento: false,
    bodega: false,
    residente_id: ''
  });

  useEffect(() => {
    cargarUnidades();
    cargarResidentes();
  }, []);

  const cargarUnidades = async () => {
    try {
      const res = await axios.get(API + '/unidades');
      setUnidades(res.data || []);
    } catch (error) {
      console.error('Error cargando unidades:', error);
    }
  };

  const cargarResidentes = async () => {
    try {
      const res = await axios.get(API + '/residentes');
      setResidentes(res.data || []);
    } catch (error) {
      console.error('Error cargando residentes:', error);
    }
  };

  const guardarUnidad = async () => {
    if (soloLectura) return alert('Modo solo lectura - No puedes modificar');
    try {
      if (editando) {
        await axios.put(API + '/unidades/' + editando.id, formData);
      } else {
        await axios.post(API + '/unidades', formData);
      }
      setModalAbierto(false);
      setEditando(null);
      setFormData({ numero: '', torre: '', tipo: 'depto', metros_cuadrados: '', estacionamiento: false, bodega: false, residente_id: '' });
      cargarUnidades();
      alert(editando ? 'Unidad actualizada' : 'Unidad creada');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const eliminarUnidad = async (id) => {
    if (soloLectura) return alert('Modo solo lectura - No puedes modificar');
    if (confirm('¿Eliminar esta unidad?')) {
      await axios.delete(API + '/unidades/' + id);
      cargarUnidades();
      alert('Unidad eliminada');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Unidades</h1>
          <p className="text-white/70">Gestiona todas las unidades del condominio</p>
        </div>
        {!soloLectura && (
          <button onClick={() => setModalAbierto(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Plus size={20} /> Agregar Unidad
          </button>
        )}
      </div>

      {soloLectura && (
        <div className="bg-yellow-500/20 text-yellow-200 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
          <Eye size={16} /> Modo solo lectura - No puedes realizar cambios
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Número</th>
                <th className="p-4 text-left">Torre</th>
                <th className="p-4 text-left">Tipo</th>
                <th className="p-4 text-left">m²</th>
                <th className="p-4 text-left">Residente</th>
                {!soloLectura && <th className="p-4 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {unidades.map(u => (
                <tr key={u.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4 font-semibold">{u.numero}</td>
                  <td className="p-4">{u.torre || '-'}</td>
                  <td className="p-4">{u.tipo === 'depto' ? 'Departamento' : 'Casa'}</td>
                  <td className="p-4">{u.metros_cuadrados || '-'} m²</td>
                  <td className="p-4">{u.residente_nombre || '-'}</td>
                  {!soloLectura && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => { 
                          setEditando(u); 
                          setFormData({ 
                            numero: u.numero, 
                            torre: u.torre || '', 
                            tipo: u.tipo || 'depto', 
                            metros_cuadrados: u.metros_cuadrados || '', 
                            estacionamiento: u.estacionamiento === 1, 
                            bodega: u.bodega === 1, 
                            residente_id: u.residente_id || '' 
                          }); 
                          setModalAbierto(true); 
                        }} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40 transition text-sm flex items-center gap-1">
                          <Edit size={14} /> Editar
                        </button>
                        <button onClick={() => eliminarUnidad(u.id)} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition text-sm flex items-center gap-1">
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {unidades.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay unidades registradas.</div>
          )}
        </div>
      </div>

      {modalAbierto && !soloLectura && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar Unidad' : 'Nueva Unidad'}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Número" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
              <input type="text" placeholder="Torre" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={formData.torre} onChange={e => setFormData({...formData, torre: e.target.value})} />
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                <option value="depto">Departamento</option>
                <option value="casa">Casa</option>
              </select>
              <input type="number" placeholder="Metros cuadrados" className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={formData.metros_cuadrados} onChange={e => setFormData({...formData, metros_cuadrados: e.target.value})} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.estacionamiento} onChange={e => setFormData({...formData, estacionamiento: e.target.checked})} /> 
                  Estacionamiento
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.bodega} onChange={e => setFormData({...formData, bodega: e.target.checked})} /> 
                  Bodega
                </label>
              </div>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={formData.residente_id} onChange={e => setFormData({...formData, residente_id: e.target.value})}>
                <option value="">Sin residente</option>
                {residentes.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button onClick={guardarUnidad} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Unidades;
