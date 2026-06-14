import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, Package, Users, Plus, Trash2, 
  CheckCircle, XCircle, AlertCircle, Calendar,
  Eye, LogOut
} from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

export default function Conserjeria({ user }) {
  const [tab, setTab] = useState('bitacora');
  const [bitacora, setBitacora] = useState([]);
  const [encomiendas, setEncomiendas] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const esAdmin = user?.rol === 'admin';
  const esConserje = user?.rol === 'conserje';
  const puedeEditar = esAdmin || esConserje;

  useEffect(() => {
    cargarDatos();
    cargarResidentes();
    cargarUnidades();
  }, [tab]);

  const cargarDatos = async () => {
    try {
      if (tab === 'bitacora') {
        const res = await axios.get(`${API}/bitacora`);
        setBitacora(res.data);
      } else if (tab === 'encomiendas') {
        const res = await axios.get(`${API}/encomiendas`);
        setEncomiendas(res.data);
      } else if (tab === 'visitas') {
        const res = await axios.get(`${API}/visitas`);
        setVisitas(res.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const cargarResidentes = async () => {
    try {
      const res = await axios.get(`${API}/residentes`);
      setResidentes(res.data);
    } catch (error) {
      console.error('Error cargando residentes:', error);
    }
  };

  const cargarUnidades = async () => {
    try {
      const res = await axios.get(`${API}/unidades`);
      setUnidades(res.data);
    } catch (error) {
      console.error('Error cargando unidades:', error);
    }
  };

  const abrirModal = (tipo, item = null) => {
    setModalTipo(tipo);
    if (item) {
      setFormData(item);
    } else {
      if (tipo === 'bitacora') {
        setFormData({ tipo: 'info', descripcion: '' });
      } else if (tipo === 'encomienda') {
        setFormData({ residente_id: '', remitente: '', descripcion: '' });
      } else if (tipo === 'visita') {
        setFormData({ 
          visitante_nombre: '', visitante_rut: '', visitante_telefono: '', 
          motivo: '', unidad_destino_id: '', placa_vehiculo: '' 
        });
      }
    }
    setModalAbierto(true);
  };

  const guardarRegistro = async () => {
    setLoading(true);
    try {
      if (modalTipo === 'bitacora') {
        await axios.post(`${API}/bitacora`, formData);
      } else if (modalTipo === 'encomienda') {
        await axios.post(`${API}/encomiendas`, formData);
      } else if (modalTipo === 'visita') {
        await axios.post(`${API}/visitas`, formData);
      }
      alert('âœ… Registro guardado correctamente');
      setModalAbierto(false);
      cargarDatos();
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
    setLoading(false);
  };

  const marcarEntregado = async (id) => {
    if (confirm('Â¿Marcar esta encomienda como entregada?')) {
      await axios.put(`${API}/encomiendas/${id}/entregar`);
      cargarDatos();
      alert('âœ… Encomienda marcada como entregada');
    }
  };

  const registrarSalida = async (id) => {
    if (confirm('Â¿Registrar salida de esta visita?')) {
      await axios.put(`${API}/visitas/${id}/salir`);
      cargarDatos();
      alert('âœ… Salida registrada');
    }
  };

  const eliminarRegistro = async (id, tipo) => {
    if (confirm('Â¿Eliminar este registro?')) {
      await axios.delete(`${API}/${tipo}/${id}`);
      cargarDatos();
      alert('âœ… Registro eliminado');
    }
  };

  // Obtener nombre de residente con unidad
  const getResidenteLabel = (residente) => {
    if (!residente) return 'No seleccionado';
    if (residente.unidad_numero) {
      return `${residente.nombre} - Unidad ${residente.unidad_numero}`;
    }
    return `${residente.nombre} (sin unidad asignada)`;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">ConserjerÃ­a</h1>
        <p className="text-white/70">GestiÃ³n de bitÃ¡cora, encomiendas y control de visitas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/20 pb-2">
        <button
          onClick={() => setTab('bitacora')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${tab === 'bitacora' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
        >
          <ClipboardList size={18} /> BitÃ¡cora
        </button>
        <button
          onClick={() => setTab('encomiendas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${tab === 'encomiendas' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
        >
          <Package size={18} /> Encomiendas
        </button>
        <button
          onClick={() => setTab('visitas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${tab === 'visitas' ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'}`}
        >
          <Users size={18} /> Visitas
        </button>
      </div>

      {/* BotÃ³n agregar segÃºn tab */}
      {puedeEditar && (
        <div className="flex justify-end">
          <button
            onClick={() => abrirModal(tab === 'bitacora' ? 'bitacora' : tab === 'encomiendas' ? 'encomienda' : 'visita')}
            className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600 transition"
          >
            <Plus size={18} /> 
            {tab === 'bitacora' ? 'Nueva entrada' : tab === 'encomiendas' ? 'Registrar encomienda' : 'Registrar visita'}
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* BITÃCORA */}
      {/* ============================================ */}
      {tab === 'bitacora' && (
        <div className="space-y-3">
          {bitacora.map(b => (
            <div key={b.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {b.tipo === 'alerta' && <AlertCircle className="text-yellow-400" size={20} />}
                  {b.tipo === 'incidencia' && <XCircle className="text-red-400" size={20} />}
                  {b.tipo === 'info' && <CheckCircle className="text-green-400" size={20} />}
                  <div>
                    <p className="text-white/60 text-sm">{new Date(b.fecha).toLocaleString()}</p>
                    <p className="text-white">{b.descripcion}</p>
                    <p className="text-white/40 text-xs mt-1">Registrado por: {b.conserje_nombre || 'Sistema'}</p>
                  </div>
                </div>
                {puedeEditar && (
                  <button onClick={() => eliminarRegistro(b.id, 'bitacora')} className="text-red-400 hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {bitacora.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay entradas en la bitÃ¡cora</div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* ENCOMIENDAS */}
      {/* ============================================ */}
      {tab === 'encomiendas' && (
        <div className="space-y-3">
          {encomiendas.map(e => (
            <div key={e.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-blue-400" />
                    <span className="font-semibold text-white">
                      Encomienda para: {e.residente_nombre || 'Residente desconocido'}
                      {e.unidad_numero && <span className="text-white/60 ml-2">(Unidad {e.unidad_numero})</span>}
                    </span>
                    {e.estado === 'entregado' ? (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Entregado</span>
                    ) : (
                      <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Pendiente</span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mt-1">Remitente: {e.remitente}</p>
                  <p className="text-white/80 text-sm">{e.descripcion}</p>
                  <p className="text-white/40 text-xs mt-1">Ingresado: {new Date(e.fecha_ingreso).toLocaleString()}</p>
                  {e.fecha_retiro && <p className="text-white/40 text-xs">Retirado: {new Date(e.fecha_retiro).toLocaleString()}</p>}
                </div>
                <div className="flex gap-2">
                  {e.estado !== 'entregado' && puedeEditar && (
                    <button onClick={() => marcarEntregado(e.id)} className="text-green-400 hover:text-green-300">
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {puedeEditar && (
                    <button onClick={() => eliminarRegistro(e.id, 'encomiendas')} className="text-red-400 hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {encomiendas.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay encomiendas registradas</div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* VISITAS */}
      {/* ============================================ */}
      {tab === 'visitas' && (
        <div className="space-y-3">
          {visitas.map(v => (
            <div key={v.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-purple-400" />
                    <span className="font-semibold text-white">{v.visitante_nombre}</span>
                    {v.estado === 'activa' ? (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">En el edificio</span>
                    ) : (
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">SaliÃ³</span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm mt-1">Unidad destino: {v.unidad_numero || 'No especificada'}</p>
                  <p className="text-white/80 text-sm">Motivo: {v.motivo || 'No especificado'}</p>
                  {v.visitante_rut && <p className="text-white/40 text-xs">RUT: {v.visitante_rut}</p>}
                  {v.placa_vehiculo && <p className="text-white/40 text-xs">VehÃ­culo: {v.placa_vehiculo}</p>}
                  <p className="text-white/40 text-xs mt-1">Entrada: {new Date(v.fecha_entrada).toLocaleString()}</p>
                  {v.fecha_salida && <p className="text-white/40 text-xs">Salida: {new Date(v.fecha_salida).toLocaleString()}</p>}
                </div>
                <div className="flex gap-2">
                  {v.estado === 'activa' && puedeEditar && (
                    <button onClick={() => registrarSalida(v.id)} className="text-yellow-400 hover:text-yellow-300">
                      <LogOut size={18} />
                    </button>
                  )}
                  {puedeEditar && (
                    <button onClick={() => eliminarRegistro(v.id, 'visitas')} className="text-red-400 hover:text-red-300">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {visitas.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay visitas registradas</div>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL PARA AGREGAR/EDITAR */}
      {/* ============================================ */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">
              {modalTipo === 'bitacora' && 'Nueva entrada en bitÃ¡cora'}
              {modalTipo === 'encomienda' && 'Registrar encomienda'}
              {modalTipo === 'visita' && 'Registrar visita'}
            </h2>
            
            {modalTipo === 'bitacora' && (
              <div className="space-y-3">
                <select className="w-full p-2 border rounded-xl" value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option value="info">InformaciÃ³n</option>
                  <option value="alerta">Alerta</option>
                  <option value="incidencia">Incidencia</option>
                </select>
                <textarea placeholder="DescripciÃ³n" className="w-full p-2 border rounded-xl" rows="3" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              </div>
            )}

            {modalTipo === 'encomienda' && (
              <div className="space-y-3">
                <select className="w-full p-2 border rounded-xl" value={formData.residente_id} onChange={e => setFormData({...formData, residente_id: e.target.value})}>
                  <option value="">Seleccionar residente</option>
                  {residentes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} {r.unidad_numero ? `- Unidad ${r.unidad_numero}` : '(sin unidad)'}
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Remitente" className="w-full p-2 border rounded-xl" value={formData.remitente} onChange={e => setFormData({...formData, remitente: e.target.value})} />
                <input type="text" placeholder="DescripciÃ³n (paquete, tamaÃ±o, etc.)" className="w-full p-2 border rounded-xl" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              </div>
            )}

            {modalTipo === 'visita' && (
              <div className="space-y-3">
                <input type="text" placeholder="Nombre del visitante *" className="w-full p-2 border rounded-xl" value={formData.visitante_nombre} onChange={e => setFormData({...formData, visitante_nombre: e.target.value})} />
                <input type="text" placeholder="RUT (opcional)" className="w-full p-2 border rounded-xl" value={formData.visitante_rut} onChange={e => setFormData({...formData, visitante_rut: e.target.value})} />
                <input type="text" placeholder="TelÃ©fono (opcional)" className="w-full p-2 border rounded-xl" value={formData.visitante_telefono} onChange={e => setFormData({...formData, visitante_telefono: e.target.value})} />
                <select className="w-full p-2 border rounded-xl" value={formData.unidad_destino_id} onChange={e => setFormData({...formData, unidad_destino_id: e.target.value})}>
                  <option value="">Seleccionar unidad destino</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>
                      Unidad {u.numero} - {u.residente_nombre || 'Sin residente'}
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Motivo de la visita" className="w-full p-2 border rounded-xl" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} />
                <input type="text" placeholder="Placa vehÃ­culo (opcional)" className="w-full p-2 border rounded-xl" value={formData.placa_vehiculo} onChange={e => setFormData({...formData, placa_vehiculo: e.target.value})} />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition">Cancelar</button>
              <button onClick={guardarRegistro} disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}