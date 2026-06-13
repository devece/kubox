import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, Home, DollarSign, Shield } from 'lucide-react';

const API = 'http://localhost:3001/api';

export default function ConserjeDashboard() {
  const [dashboard, setDashboard] = useState({});
  const [morosos, setMorosos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
    cargarMorosos();
  }, []);

  const cargarDashboard = async () => {
    try {
      const res = await axios.get(`${API}/dashboard-stats`);
      setDashboard(res.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    }
  };

  const cargarMorosos = async () => {
    try {
      const res = await axios.get(`${API}/morosos-detalle`);
      setMorosos(res.data);
    } catch (error) {
      console.error('Error cargando morosos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Panel del Conserje</h1>
        <p className="text-white/70">Bienvenido. Aquí puedes verificar el estado de los residentes</p>
      </div>

      {/* Tarjetas de resumen (solo lo necesario para conserje) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <Home className="w-6 h-6 text-white" />
            <h3 className="text-white/70 text-sm">Total Unidades</h3>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.total_unidades || 0}</p>
          <p className="text-xs text-white/40 mt-1">{dashboard.ocupadas || 0} ocupadas</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-white" />
            <h3 className="text-white/70 text-sm">Total Residentes</h3>
          </div>
          <p className="text-3xl font-bold text-white">{dashboard.total_residentes || 0}</p>
          <p className="text-xs text-white/40 mt-1">registrados</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-white/70 text-sm">Residentes Morosos</h3>
          </div>
          <p className="text-3xl font-bold text-red-400">{dashboard.morosos || 0}</p>
          <p className="text-xs text-white/40 mt-1">con deuda pendiente</p>
        </div>
      </div>

      {/* Lista de morosos */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <h3 className="text-lg font-semibold text-white p-6 pb-0 flex items-center gap-2">
          <AlertCircle size={20} /> Residentes con deuda (no pueden reservar)
        </h3>
        <div className="p-6">
          {morosos.length === 0 ? (
            <div className="text-center py-8 text-white/50">No hay residentes morosos</div>
          ) : (
            <div className="space-y-3">
              {morosos.map(m => (
                <div key={m.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{m.nombre}</p>
                      <p className="text-white/60 text-sm">Unidad {m.unidad_numero}</p>
                      <p className="text-white/50 text-xs mt-1">Email: {m.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold">${(m.deuda_total || 0).toLocaleString()}</p>
                      <p className="text-xs text-white/50">{m.meses_moroso} meses moroso</p>
                      <span className="inline-block mt-2 text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                        🚫 No puede reservar
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información para el conserje */}
      <div className="bg-blue-500/20 rounded-2xl p-4 border border-blue-300/20">
        <p className="text-blue-200 text-sm flex items-center gap-2">
          <Shield size={16} />
          <strong>Nota:</strong> Los residentes marcados como morosos no pueden hacer reservas de espacios comunes.
          Si un residente regulariza su deuda, su estado se actualizará automáticamente.
        </p>
      </div>
    </div>
  );
}