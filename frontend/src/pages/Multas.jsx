import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Plus, Trash2, Edit, DollarSign, CheckCircle, XCircle } from 'lucide-react';

const API = 'http://localhost:3001/api';

function Multas({ user }) {
  const [multas, setMultas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    unidad_id: '',
    fecha: new Date().toISOString().split('T')[0],
    motivo: '',
    monto: ''
  });
  const [cargando, setCargando] = useState(true);
  const esAdmin = user?.rol === 'admin';

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [multasRes, unidadesRes] = await Promise.all([
        axios.get(API + '/multas'),
        axios.get(API + '/unidades')
      ]);
      setMultas(multasRes.data || []);
      setUnidades(unidadesRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (multa = null) => {
    if (multa) {
      setEditando(multa);
      setFormData({
        unidad_id: multa.unidad_id,
        fecha: multa.fecha,
        motivo: multa.motivo,
        monto: multa.monto
      });
    } else {
      setEditando(null);
      setFormData({
        unidad_id: '',
        fecha: new Date().toISOString().split('T')[0],
        motivo: '',
        monto: ''
      });
    }
    setModalAbierto(true);
  };

  const guardarMulta = async () => {
    if (!esAdmin) return alert('Solo administradores');
    if (!formData.unidad_id || !formData.motivo || !formData.monto) {
      alert('Completa todos los campos');
      return;
    }
    try {
      if (editando) {
        await axios.put(API + '/multas/' + editando.id, formData);
        alert('✅ Multa actualizada');
      } else {
        await axios.post(API + '/multas', formData);
        alert('✅ Multa registrada');
      }
      setModalAbierto(false);
      setEditando(null);
      setFormData({ unidad_id: '', fecha: new Date().toISOString().split('T')[0], motivo: '', monto: '' });
      cargarDatos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const marcarPagada = async (id) => {
    const fechaPago = new Date().toISOString().split('T')[0];
    await axios.put(API + '/multas/' + id, { pagado: 1, fecha_pago: fechaPago });
    cargarDatos();
    alert('✅ Multa marcada como pagada');
  };

  const eliminarMulta = async (id) => {
    if (confirm('¿Eliminar esta multa?')) {
      await axios.delete(API + '/multas/' + id);
      cargarDatos();
      alert('✅ Multa eliminada');
    }
  };

  const getUnidadNumero = (id) => {
    const unidad = unidades.find(u => u.id === id);
    return unidad?.numero || 'N/A';
  };

  const totalMultas = multas.reduce((sum, m) => sum + (m.monto || 0), 0);
  const totalPagado = multas.filter(m => m.pagado === 1).reduce((sum, m) => sum + (m.monto || 0), 0);
  const totalPendiente = totalMultas - totalPagado;

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Multas</h1>
          <p className="text-white/70">Registro y gestión de multas por unidad</p>
        </div>
        {esAdmin && (
          <button onClick={() => abrirModal()} className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Plus size={20} /> Nueva Multa
          </button>
        )}
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <DollarSign className="w-8 h-8 text-white mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Total Multas</h3>
          <p className="text-2xl font-bold text-white mt-1">${totalMultas.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Total Pagado</h3>
          <p className="text-2xl font-bold text-white mt-1">${totalPagado.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <XCircle className="w-8 h-8 text-red-400 mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Pendiente</h3>
          <p className="text-2xl font-bold text-white mt-1">${totalPendiente.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabla de multas */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Unidad</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Motivo</th>
                <th className="p-4 text-left">Monto</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Período</th>
                {esAdmin && <th className="p-4 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {multas.map(m => (
                <tr key={m.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4 font-medium">Unidad {getUnidadNumero(m.unidad_id)}</td>
                  <td className="p-4">{m.fecha}</td>
                  <td className="p-4">{m.motivo}</td>
                  <td className="p-4 text-red-400 font-semibold">${m.monto?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={m.pagado === 1 ? 'px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300' : 'px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300'}>
                      {m.pagado === 1 ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-white/60">{m.periodo || '-'}</td>
                  {esAdmin && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => abrirModal(m)} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40 transition text-sm flex items-center gap-1">
                          <Edit size={14} /> Editar
                        </button>
                        {m.pagado !== 1 && (
                          <button onClick={() => marcarPagada(m.id)} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/40 transition text-sm flex items-center gap-1">
                            <CheckCircle size={14} /> Pagar
                          </button>
                        )}
                        <button onClick={() => eliminarMulta(m.id)} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition text-sm flex items-center gap-1">
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {multas.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay multas registradas</div>
          )}
        </div>
      </div>

      {/* Modal Nueva/Editar Multa */}
      {modalAbierto && esAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar Multa' : 'Nueva Multa'}</h2>
            <div className="space-y-3">
              <select 
                className="w-full px-4 py-2 border rounded-xl" 
                value={formData.unidad_id} 
                onChange={e => setFormData({...formData, unidad_id: e.target.value})}
              >
                <option value="">Seleccionar unidad</option>
                {unidades.map(u => <option key={u.id} value={u.id}>Unidad {u.numero}</option>)}
              </select>
              <input 
                type="date" 
                className="w-full px-4 py-2 border rounded-xl" 
                value={formData.fecha} 
                onChange={e => setFormData({...formData, fecha: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Motivo de la multa" 
                className="w-full px-4 py-2 border rounded-xl" 
                value={formData.motivo} 
                onChange={e => setFormData({...formData, motivo: e.target.value})} 
              />
              <input 
                type="number" 
                placeholder="Monto" 
                className="w-full px-4 py-2 border rounded-xl" 
                value={formData.monto} 
                onChange={e => setFormData({...formData, monto: e.target.value})} 
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button onClick={guardarMulta} className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-2 rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Multas;