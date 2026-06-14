import { useState, useEffect } from "react";
import axios from "axios";
import { DollarSign, Plus, Trash2, Edit, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

const API = "https://kubox-production-493b.up.railway.app/api";

function Gastos({ user, soloLectura = false }) {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    concepto: "",
    monto: "",
    fecha: "",
    categoria: "",
    proveedor: "",
    es_cuotas: false,
    total_cuotas: 1,
    cuota_actual: 1,
    monto_cuota: 0
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarGastos();
    cargarCategorias();
  }, []);

  const cargarGastos = async () => {
    try {
      const res = await axios.get(API + "/gastos");
      setGastos(res.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const res = await axios.get(API + "/categorias-gastos");
      setCategorias(res.data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const guardarGasto = async () => {
    if (soloLectura) return alert("Modo solo lectura");
    try {
      const data = { ...formData };
      if (data.es_cuotas) {
        data.monto_cuota = Math.round(data.monto / data.total_cuotas);
      } else {
        data.monto_cuota = data.monto;
        data.total_cuotas = 1;
        data.cuota_actual = 1;
      }
      
      if (editando) {
        await axios.put(API + "/gastos/" + editando.id, data);
      } else {
        await axios.post(API + "/gastos", data);
      }
      setModalAbierto(false);
      setEditando(null);
      setFormData({ concepto: "", monto: "", fecha: "", categoria: "", proveedor: "", es_cuotas: false, total_cuotas: 1, cuota_actual: 1, monto_cuota: 0 });
      cargarGastos();
      alert(editando ? "✅ Gasto actualizado" : "✅ Gasto creado");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const eliminarGasto = async (id) => {
    if (soloLectura) return alert("Modo solo lectura");
    if (confirm("¿Eliminar este gasto?")) {
      await axios.delete(API + "/gastos/" + id);
      cargarGastos();
      alert("✅ Gasto eliminado");
    }
  };

  const totalGastos = gastos.reduce((sum, g) => sum + (g.monto_cuota || g.monto || 0), 0);

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gastos</h1>
          <p className="text-white/70">Registro de gastos del edificio</p>
        </div>
        {!soloLectura && (
          <button onClick={() => setModalAbierto(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Plus size={20} /> Nuevo Gasto
          </button>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-white" />
          <h3 className="text-white font-semibold">Total Gastos del Periodo</h3>
        </div>
        <p className="text-3xl font-bold text-white">${totalGastos.toLocaleString()}</p>
        <p className="text-white/40 text-sm mt-1">Suma de todos los gastos (incluye cuotas del mes)</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Concepto</th>
                <th className="p-4 text-left">Monto</th>
                <th className="p-4 text-left">Cuota</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Categoría</th>
                <th className="p-4 text-left">Proveedor</th>
                {!soloLectura && <th className="p-4 text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {gastos.map(g => (
                <tr key={g.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4 font-medium">{g.concepto}</td>
                  <td className="p-4">${(g.monto_cuota || g.monto || 0).toLocaleString()}</td>
                  <td className="p-4 text-sm">
                    {g.es_cuotas ? (g.cuota_actual || 1) + "/" + (g.total_cuotas || 1) : "-"}
                  </td>
                  <td className="p-4">{g.fecha || "-"}</td>
                  <td className="p-4">{g.categoria || "-"}</td>
                  <td className="p-4">{g.proveedor || "-"}</td>
                  {!soloLectura && (
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditando(g); setFormData({ concepto: g.concepto, monto: g.monto, fecha: g.fecha, categoria: g.categoria, proveedor: g.proveedor || "", es_cuotas: g.es_cuotas === 1, total_cuotas: g.total_cuotas || 1, cuota_actual: g.cuota_actual || 1, monto_cuota: g.monto_cuota || 0 }); setModalAbierto(true); }} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40 transition text-sm">Editar</button>
                        <button onClick={() => eliminarGasto(g.id)} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition text-sm">Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {gastos.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay gastos registrados</div>
          )}
        </div>
      </div>

      {modalAbierto && !soloLectura && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editando ? "Editar Gasto" : "Nuevo Gasto"}</h2>
            <div className="space-y-3">
              <input type="text" placeholder="Concepto" className="w-full px-4 py-2 border rounded-xl" value={formData.concepto} onChange={e => setFormData({...formData, concepto: e.target.value})} />
              <input type="number" placeholder="Monto Total" className="w-full px-4 py-2 border rounded-xl" value={formData.monto} onChange={e => setFormData({...formData, monto: parseFloat(e.target.value)})} />
              <input type="date" className="w-full px-4 py-2 border rounded-xl" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} />
              <select className="w-full px-4 py-2 border rounded-xl" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                <option value="">Seleccionar categoría</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Servicios">Servicios</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Seguro">Seguro</option>
                <option value="Administracion">Administración</option>
                <option value="Otro">Otro</option>
              </select>
              <input type="text" placeholder="Proveedor" className="w-full px-4 py-2 border rounded-xl" value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})} />
              
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="es_cuotas" checked={formData.es_cuotas} onChange={e => setFormData({...formData, es_cuotas: e.target.checked, total_cuotas: e.target.checked ? 2 : 1, cuota_actual: 1})} />
                <label htmlFor="es_cuotas" className="text-gray-700">Dividir en cuotas</label>
              </div>
              
              {formData.es_cuotas && (
                <div className="flex gap-2">
                  <input type="number" min="2" max="24" placeholder="N° Cuotas" className="w-1/2 px-4 py-2 border rounded-xl" value={formData.total_cuotas} onChange={e => setFormData({...formData, total_cuotas: parseInt(e.target.value) || 2, monto_cuota: Math.round(formData.monto / (parseInt(e.target.value) || 2))})} />
                  <input type="number" placeholder="Cuota N°" className="w-1/2 px-4 py-2 border rounded-xl" value={formData.cuota_actual} onChange={e => setFormData({...formData, cuota_actual: parseInt(e.target.value) || 1})} />
                </div>
              )}
              
              {formData.es_cuotas && formData.monto && (
                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  Monto por cuota: ${Math.round(formData.monto / formData.total_cuotas).toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button onClick={guardarGasto} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gastos;
