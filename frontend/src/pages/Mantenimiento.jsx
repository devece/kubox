import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Wrench, CheckCircle, Clock, Plus, Eye } from "lucide-react";

const API = "http://localhost:3001/api";

function Mantenimiento({ user, soloLectura = false }) {
  const [equipos, setEquipos] = useState([]);
  const [mantenciones, setMantenciones] = useState([]);
  const [vista, setVista] = useState("calendario");
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarEquipos();
    cargarMantenciones();
  }, []);

  const cargarEquipos = async () => {
    const res = await axios.get(`${API}/equipos`);
    setEquipos(res.data);
  };

  const cargarMantenciones = async () => {
    const res = await axios.get(`${API}/mantenciones`);
    setMantenciones(res.data);
  };

  const programarMantencion = async (equipoId, fecha) => {
    if (soloLectura) return alert("Modo solo lectura - No puedes programar mantenciones");
    try {
      await axios.post(`${API}/mantenciones`, {
        equipo_id: equipoId,
        fecha_programada: fecha,
        estado: "pendiente",
      });
      cargarMantenciones();
      alert("✅ Mantención programada");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const completarMantencion = async (id) => {
    if (soloLectura) return alert("Modo solo lectura - No puedes completar mantenciones");
    const observaciones = prompt("Observaciones de la mantención:");
    if (observaciones !== null) {
      await axios.put(`${API}/mantenciones/${id}`, {
        estado: "completada",
        fecha_realizacion: new Date().toISOString().split("T")[0],
        observaciones,
      });
      cargarMantenciones();
      alert("✅ Mantención completada");
    }
  };

  const getEstadoColor = (estado) => {
    if (estado === "pendiente") return "bg-yellow-500/20 text-yellow-300";
    if (estado === "completada") return "bg-green-500/20 text-green-300";
    return "bg-gray-500/20 text-gray-300";
  };

  const mantencionesPorFecha = mantenciones.reduce((acc, m) => {
    const fecha = m.fecha_programada;
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(m);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Mantenimiento</h1>
          <p className="text-white/70">Gestión de equipos y mantenciones preventivas</p>
          {soloLectura && (
            <div className="mt-2 bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-lg text-sm inline-flex items-center gap-2">
              <Eye size={14} /> Modo solo lectura
            </div>
          )}
        </div>
        {!soloLectura && user?.rol === "admin" && (
          <button onClick={() => setModalAbierto(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Plus size={20} /> Agregar Equipo
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 bg-white/10 rounded-xl p-1 w-fit">
        <button onClick={() => setVista("calendario")} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${vista === "calendario" ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "text-white/70 hover:text-white"}`}>
          <Calendar size={18} /> Calendario
        </button>
        <button onClick={() => setVista("equipos")} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${vista === "equipos" ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "text-white/70 hover:text-white"}`}>
          <Wrench size={18} /> Equipos
        </button>
        <button onClick={() => setVista("historial")} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${vista === "historial" ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "text-white/70 hover:text-white"}`}>
          <Clock size={18} /> Historial
        </button>
      </div>

      {vista === "calendario" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">📅 Mantenciones Programadas</h2>
          {Object.entries(mantencionesPorFecha).map(([fecha, items]) => (
            <div key={fecha} className="border border-white/10 rounded-xl overflow-hidden mb-3">
              <div className="bg-white/5 px-4 py-2">
                <span className="font-medium text-white">{fecha}</span>
                <span className="text-white/40 text-sm ml-2">({items.length})</span>
              </div>
              <div className="divide-y divide-white/10">
                {items.map((m) => {
                  const equipo = equipos.find((e) => e.id === m.equipo_id);
                  return (
                    <div key={m.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{equipo?.nombre || "Equipo"}</p>
                        <p className="text-white/50 text-sm">{equipo?.ubicacion}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(m.estado)}`}>
                          {m.estado === "pendiente" ? "⏳ Pendiente" : "✅ Completada"}
                        </span>
                        {!soloLectura && m.estado === "pendiente" && user?.rol === "admin" && (
                          <button onClick={() => completarMantencion(m.id)} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm">Completar</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(mantencionesPorFecha).length === 0 && <div className="text-center py-12 text-white/40">No hay mantenciones programadas.</div>}
        </div>
      )}

      {vista === "equipos" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-white/70 text-sm">
                  <th className="p-4 text-left">Equipo</th>
                  <th className="p-4 text-left">Ubicación</th>
                  <th className="p-4 text-left">Frecuencia</th>
                  <th className="p-4 text-left">Proveedor</th>
                  {!soloLectura && <th className="p-4 text-left">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {equipos.map((e) => (
                  <tr key={e.id} className="border-t border-white/10">
                    <td className="p-4 text-white">{e.nombre}</td>
                    <td className="p-4 text-white/70">{e.ubicacion}</td>
                    <td className="p-4 text-white/70">Cada {e.frecuencia_dias} días</td>
                    <td className="p-4 text-white/70">{e.proveedor}</td>
                    {!soloLectura && (
                      <td className="p-4">
                        <button onClick={() => { const fecha = prompt("Fecha (YYYY-MM-DD):", new Date().toISOString().split("T")[0]); if (fecha) programarMantencion(e.id, fecha); }} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm flex items-center gap-1">
                          <Calendar size={14} /> Programar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vista === "historial" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-semibold mb-4">✅ Mantenciones Completadas</h3>
          {mantenciones.filter((m) => m.estado === "completada").map((m) => {
            const equipo = equipos.find((e) => e.id === m.equipo_id);
            return (
              <div key={m.id} className="border-b border-white/10 py-3">
                <p className="text-white font-medium">{equipo?.nombre}</p>
                <p className="text-white/50 text-sm">Realizada: {m.fecha_realizacion}</p>
                {m.observaciones && <p className="text-white/30 text-sm mt-1">📝 {m.observaciones}</p>}
              </div>
            );
          })}
          {mantenciones.filter((m) => m.estado === "completada").length === 0 && <div className="text-center py-12 text-white/40">No hay mantenciones completadas.</div>}
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Nuevo Equipo</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              axios.post(`${API}/equipos`, {
                nombre: formData.get("nombre"),
                ubicacion: formData.get("ubicacion"),
                tipo: formData.get("tipo"),
                frecuencia_dias: parseInt(formData.get("frecuencia_dias")),
                proveedor: formData.get("proveedor"),
                contacto: formData.get("contacto"),
              }).then(() => {
                cargarEquipos();
                setModalAbierto(false);
                alert("✅ Equipo agregado");
              }).catch((err) => alert("Error: " + err.message));
            }}>
              <div className="space-y-3">
                <input name="nombre" placeholder="Nombre" className="w-full px-4 py-2 border rounded-xl" required />
                <input name="ubicacion" placeholder="Ubicación" className="w-full px-4 py-2 border rounded-xl" required />
                <select name="tipo" className="w-full px-4 py-2 border rounded-xl">
                  <option value="Ascensor">Ascensor</option>
                  <option value="Bombas">Bombas</option>
                  <option value="Portón">Portón</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="Generador">Generador</option>
                  <option value="Seguridad">Seguridad</option>
                </select>
                <input name="frecuencia_dias" type="number" placeholder="Frecuencia (días)" className="w-full px-4 py-2 border rounded-xl" required />
                <input name="proveedor" placeholder="Proveedor" className="w-full px-4 py-2 border rounded-xl" />
                <input name="contacto" placeholder="Contacto" className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mantenimiento;
