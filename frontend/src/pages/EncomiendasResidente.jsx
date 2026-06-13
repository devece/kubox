import { useState, useEffect } from "react";
import axios from "axios";
import { Package, CheckCircle, Clock } from "lucide-react";

const API = "http://localhost:3001/api";

function EncomiendasResidente({ residenteEmail }) {
  const [encomiendas, setEncomiendas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarEncomiendas();
  }, []);

  const cargarEncomiendas = async () => {
    try {
      const res = await axios.get(API + "/encomiendas/residente/" + residenteEmail);
      setEncomiendas(res.data);
    } catch (error) {
      console.error("Error cargando encomiendas:", error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado) => {
    return estado === "entregada" 
      ? "bg-green-500/20 text-green-300" 
      : "bg-yellow-500/20 text-yellow-300";
  };

  const getEstadoIcono = (estado) => {
    return estado === "entregada" 
      ? <CheckCircle size={16} className="text-green-400" />
      : <Clock size={16} className="text-yellow-400" />;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mis Encomiendas</h1>
        <p className="text-white/70">Paquetes y correspondencia recibidos</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">📦 Listado de encomiendas</h3>
        </div>
        <div className="divide-y divide-white/10">
          {cargando ? (
            <div className="text-center py-12 text-white/40">Cargando...</div>
          ) : encomiendas.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              No tienes encomiendas pendientes
            </div>
          ) : (
            encomiendas.map(e => (
              <div key={e.id} className="p-4 hover:bg-white/5 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package size={16} className="text-white/60" />
                      <span className="font-medium text-white">{e.descripcion || "Paquete"}</span>
                      <span className={"px-2 py-0.5 rounded-full text-xs flex items-center gap-1 " + getEstadoColor(e.estado)}>
                        {getEstadoIcono(e.estado)} {e.estado === "entregada" ? "Entregada" : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>📅 Ingreso: {e.fecha_ingreso}</span>
                      {e.remitente && <span>📦 Remitente: {e.remitente}</span>}
                    </div>
                    {e.fecha_retiro && (
                      <p className="text-white/40 text-sm mt-2">✅ Retirada el: {e.fecha_retiro}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EncomiendasResidente;
