import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

export default function GastosReales({ periodo, onGastoAgregado }) {
  const [categorias, setCategorias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({
    categoria_id: '',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (periodo) {
      cargarCategorias();
      cargarGastos();
    }
  }, [periodo]);

  const cargarCategorias = async () => {
    try {
      const res = await axios.get(`${API}/categorias-gastos`);
      setCategorias(res.data || []);
    } catch (error) {
      console.error('Error cargando categorÃ­as:', error);
    }
  };

  const cargarGastos = async () => {
    try {
      const res = await axios.get(`${API}/gastos-reales/${periodo}`);
      setGastos(res.data || []);
    } catch (error) {
      console.error('Error cargando gastos:', error);
    }
  };

  const guardarGasto = async () => {
    if (!formData.categoria_id || !formData.descripcion || !formData.monto) {
      alert('Completa todos los campos');
      return;
    }
    try {
      await axios.post(`${API}/gastos-reales`, {
        ...formData,
        periodo,
        monto: parseInt(formData.monto)
      });
      setMostrarModal(false);
      cargarGastos();
      if (onGastoAgregado) onGastoAgregado();
      setFormData({ categoria_id: '', descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  };

  const eliminarGasto = async (id) => {
    if (confirm('Â¿Eliminar este gasto?')) {
      await axios.delete(`${API}/gastos-reales/${id}`);
      cargarGastos();
      if (onGastoAgregado) onGastoAgregado();
    }
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">ðŸ’° Gastos del periodo {periodo}</h2>
        <button onClick={() => setMostrarModal(true)} className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1">
          <Plus size={16} /> Agregar gasto
        </button>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg mb-4 flex justify-between items-center">
        <span className="font-bold">Total gastos:</span>
        <span className="text-xl font-bold text-blue-600">${totalGastos.toLocaleString()}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">CategorÃ­a</th>
              <th className="p-2 text-left">DescripciÃ³n</th>
              <th className="p-2 text-right">Monto</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-center">AcciÃ³n</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map(g => (
              <tr key={g.id} className="border-t">
                <td className="p-2">{g.categoria_nombre}</td>
                <td className="p-2">{g.descripcion}</td>
                <td className="p-2 text-right font-bold">${g.monto.toLocaleString()}</td>
                <td className="p-2">{g.fecha}</td>
                <td className="p-2 text-center">
                  <button onClick={() => eliminarGasto(g.id)} className="text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {gastos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay gastos registrados para este periodo
        </div>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Agregar gasto</h2>
            <div className="space-y-3">
              <select className="w-full p-2 border rounded" value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})}>
                <option value="">Seleccionar categorÃ­a</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <input type="text" placeholder="DescripciÃ³n" className="w-full p-2 border rounded" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              <input type="number" placeholder="Monto" className="w-full p-2 border rounded" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} />
              <input type="date" className="w-full p-2 border rounded" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setMostrarModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
              <button onClick={guardarGasto} className="px-4 py-2 bg-blue-500 text-white rounded">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}