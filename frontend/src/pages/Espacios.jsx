import { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, Plus, Trash2, Edit, DollarSign, Clock, Shield, Castle } from 'lucide-react';

const API = 'http://localhost:3001/api';

function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    capacidad: '',
    requiere_autorizacion: false,
    cobro_activo: false,
    horario_semana_inicio: '10:00',
    horario_semana_fin: '22:00',
    horario_festivo_inicio: '10:00',
    horario_festivo_fin: '02:00',
    costo_dia_semana: 0,
    costo_dia_festivo: 0,
    garantia: 0,
    tiene_juegos_inflables: false,
    monto_extra_juegos: 0,
    dias_festivos: ''
  });

  useEffect(() => {
    cargarEspacios();
  }, []);

  const cargarEspacios = async () => {
    const res = await axios.get(API + '/espacios');
    setEspacios(res.data);
  };

  const guardarEspacio = async () => {
    try {
      if (editando) {
        await axios.put(API + '/espacios/' + editando.id, formData);
      } else {
        await axios.post(API + '/espacios', formData);
      }
      setModalAbierto(false);
      setEditando(null);
      setFormData({
        nombre: '', descripcion: '', capacidad: '', requiere_autorizacion: false, cobro_activo: false,
        horario_semana_inicio: '10:00', horario_semana_fin: '22:00',
        horario_festivo_inicio: '10:00', horario_festivo_fin: '02:00',
        costo_dia_semana: 0, costo_dia_festivo: 0, garantia: 0,
        tiene_juegos_inflables: false, monto_extra_juegos: 0, dias_festivos: ''
      });
      cargarEspacios();
      alert(editando ? 'Espacio actualizado' : 'Espacio creado');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const eliminarEspacio = async (id) => {
    if (confirm('Eliminar este espacio?')) {
      await axios.delete(API + '/espacios/' + id);
      cargarEspacios();
      alert('Espacio eliminado');
    }
  };

  const getHorarioTexto = (e) => {
    if (!e.cobro_activo) return 'Sin horario definido';
    return 'Semana (Dom-Jue): ' + (e.horario_semana_inicio || '10:00') + ' - ' + (e.horario_semana_fin || '22:00') + ' | Festivos (Vie-Sab): ' + (e.horario_festivo_inicio || '10:00') + ' - ' + (e.horario_festivo_fin || '02:00');
  };

  const getCostoTexto = (e) => {
    if (!e.cobro_activo) return 'Sin costo';
    let texto = '';
    if (e.costo_dia_semana > 0) texto += '$' + e.costo_dia_semana + '/dia (Dom-Jue)';
    if (e.costo_dia_festivo > 0) texto += ' | $' + e.costo_dia_festivo + '/dia (Vie-Sab)';
    if (e.garantia > 0) texto += ' | Garantia: $' + e.garantia;
    if (e.tiene_juegos_inflables === 1 && e.monto_extra_juegos > 0) texto += ' | Juegos Inflables: +$' + e.monto_extra_juegos;
    return texto || 'Sin costo';
  };

  const handleNumberChange = (field, value) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    setFormData({ ...formData, [field]: isNaN(numValue) ? 0 : numValue });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Espacios Comunes</h1>
          <p className="text-white/70">Gestiona los espacios comunes del condominio</p>
        </div>
        <button onClick={() => setModalAbierto(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
          <Plus size={20} /> Agregar Espacio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {espacios.map(e => (
          <div key={e.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition">
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{e.nombre}</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setEditando(e); setFormData({ nombre: e.nombre, descripcion: e.descripcion || '', capacidad: e.capacidad || '', requiere_autorizacion: e.requiere_autorizacion === 1, cobro_activo: e.cobro_activo === 1, horario_semana_inicio: e.horario_semana_inicio || '10:00', horario_semana_fin: e.horario_semana_fin || '22:00', horario_festivo_inicio: e.horario_festivo_inicio || '10:00', horario_festivo_fin: e.horario_festivo_fin || '02:00', costo_dia_semana: e.costo_dia_semana || 0, costo_dia_festivo: e.costo_dia_festivo || 0, garantia: e.garantia || 0, tiene_juegos_inflables: e.tiene_juegos_inflables === 1, monto_extra_juegos: e.monto_extra_juegos || 0, dias_festivos: e.dias_festivos || '' }); setModalAbierto(true); }} className="p-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40 transition">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => eliminarEspacio(e.id)} className="p-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-3">{e.descripcion || 'Sin descripcion'}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <span className="w-24">Capacidad:</span>
                  <span>{e.capacidad || 'N/A'} personas</span>
                </div>
                {e.cobro_activo === 1 && (
                  <>
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock size={14} className="text-white/50" />
                      <span className="text-green-400">{getHorarioTexto(e)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                      <DollarSign size={14} className="text-white/50" />
                      <span className="text-green-400">{getCostoTexto(e)}</span>
                    </div>
                  </>
                )}
                {e.garantia > 0 && (
                  <div className="flex items-center gap-2 text-white/70">
                    <Shield size={14} className="text-white/50" />
                    <span className="text-blue-400">Garantia: </span>
                  </div>
                )}
                {e.tiene_juegos_inflables === 1 && (
                  <div className="flex items-center gap-2 text-white/70">
                    <Castle size={14} className="text-white/50" />
                    <span className="text-purple-400">Juegos Inflables (+)</span>
                  </div>
                )}
                {e.requiere_autorizacion === 1 && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span>Requiere autorizacion del conserje</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar Espacio' : 'Nuevo Espacio'}</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <input type="text" placeholder="Nombre del espacio" className="w-full px-4 py-2 border rounded-xl" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <textarea placeholder="Descripcion" className="w-full px-4 py-2 border rounded-xl" rows="2" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              <input type="number" placeholder="Capacidad (personas)" className="w-full px-4 py-2 border rounded-xl" value={formData.capacidad} onChange={e => setFormData({...formData, capacidad: e.target.value})} />
              
              <div className="border-t pt-3 mt-2">
                <h4 className="font-semibold mb-2">Configuracion de Cobro</h4>
                <label className="flex items-center gap-2 mb-3">
                  <input type="checkbox" checked={formData.cobro_activo} onChange={e => setFormData({...formData, cobro_activo: e.target.checked})} />
                  Activar cobro por uso
                </label>
                
                {formData.cobro_activo && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-xl mb-3">
                      <p className="font-medium text-sm mb-2">Horario Domingo a Jueves:</p>
                      <div className="flex gap-2">
                        <input type="time" className="w-1/2 px-3 py-2 border rounded-lg" value={formData.horario_semana_inicio} onChange={e => setFormData({...formData, horario_semana_inicio: e.target.value})} />
                        <span className="self-center">a</span>
                        <input type="time" className="w-1/2 px-3 py-2 border rounded-lg" value={formData.horario_semana_fin} onChange={e => setFormData({...formData, horario_semana_fin: e.target.value})} />
                      </div>
                      <label className="block text-sm font-medium text-gray-700 mt-2">Costo por dia (Domingo a Jueves):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" placeholder="0" className="w-full pl-8 pr-4 py-2 border rounded-lg" value={formData.costo_dia_semana || ''} onChange={e => handleNumberChange('costo_dia_semana', e.target.value)} />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-xl mb-3">
                      <p className="font-medium text-sm mb-2">Horario Viernes, Sabado y Visperas de Festivos:</p>
                      <div className="flex gap-2">
                        <input type="time" className="w-1/2 px-3 py-2 border rounded-lg" value={formData.horario_festivo_inicio} onChange={e => setFormData({...formData, horario_festivo_inicio: e.target.value})} />
                        <span className="self-center">a</span>
                        <input type="time" className="w-1/2 px-3 py-2 border rounded-lg" value={formData.horario_festivo_fin} onChange={e => setFormData({...formData, horario_festivo_fin: e.target.value})} />
                      </div>
                      <label className="block text-sm font-medium text-gray-700 mt-2">Costo por dia (Viernes, Sabado y Festivos):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" placeholder="0" className="w-full pl-8 pr-4 py-2 border rounded-lg" value={formData.costo_dia_festivo || ''} onChange={e => handleNumberChange('costo_dia_festivo', e.target.value)} />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Garantia (deposito de seguridad):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input type="number" placeholder="0" className="w-full pl-8 pr-4 py-2 border rounded-lg" value={formData.garantia || ''} onChange={e => handleNumberChange('garantia', e.target.value)} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Monto que se retiene como garantia. Se devuelve si no hay daños.</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Castle size={18} className="text-purple-600" />
                        <label className="font-medium text-sm">Juegos Inflables / Adicionales</label>
                      </div>
                      <label className="flex items-center gap-2 mb-2">
                        <input type="checkbox" checked={formData.tiene_juegos_inflables} onChange={e => setFormData({...formData, tiene_juegos_inflables: e.target.checked})} />
                        Incluye juegos inflables o elementos adicionales
                      </label>
                      {formData.tiene_juegos_inflables && (
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input type="number" placeholder="Monto extra por juego" className="w-full pl-8 pr-4 py-2 border rounded-lg" value={formData.monto_extra_juegos || ''} onChange={e => handleNumberChange('monto_extra_juegos', e.target.value)} />
                          <p className="text-xs text-gray-500 mt-1">Monto adicional que se suma al costo total</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dias festivos adicionales:</label>
                      <input type="text" placeholder="ej: 25-12, 01-01, 18-09" className="w-full px-3 py-2 border rounded-lg text-sm" value={formData.dias_festivos} onChange={e => setFormData({...formData, dias_festivos: e.target.value})} />
                      <p className="text-xs text-gray-500 mt-1">Formato DD-MM, separados por comas</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="border-t pt-3 mt-2">
                <h4 className="font-semibold mb-2">Configuracion de Reserva</h4>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.requiere_autorizacion} onChange={e => setFormData({...formData, requiere_autorizacion: e.target.checked})} />
                  Requiere autorizacion del conserje
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button onClick={guardarEspacio} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Espacios;
