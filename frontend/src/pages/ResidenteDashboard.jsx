import { useState, useEffect } from 'react';
import axios from 'axios';
import { Home, DollarSign, User, Phone, Mail, CheckCircle, XCircle, Calendar } from 'lucide-react';

const API = 'http://localhost:3001/api';

function ResidenteDashboard({ residenteEmail }) {
  const [residente, setResidente] = useState(null);
  const [unidad, setUnidad] = useState(null);
  const [gastosComunes, setGastosComunes] = useState([]);
  const [resumenGastos, setResumenGastos] = useState({ pendiente: 0, pagado: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Obtener datos del residente
      const resResidente = await axios.get(API + '/residentes/email/' + residenteEmail);
      setResidente(resResidente.data);
      
      // Obtener unidad del residente
      if (resResidente.data) {
        const resUnidad = await axios.get(API + '/unidades/residente/' + resResidente.data.id);
        setUnidad(resUnidad.data);
        
        // Obtener gastos comunes de la unidad
        if (resUnidad.data) {
          const resGastos = await axios.get(API + '/gastos-comunes/unidad/' + resUnidad.data.id);
          setGastosComunes(resGastos.data);
          
          const pendiente = resGastos.data.filter(g => g.pagado !== 1).reduce((sum, g) => sum + g.monto_total, 0);
          const pagado = resGastos.data.filter(g => g.pagado === 1).reduce((sum, g) => sum + g.monto_total, 0);
          setResumenGastos({ pendiente, pagado });
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pagado': return 'bg-green-500/20 text-green-300';
      case 'pendiente': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Mi Dashboard</h1>
        <p className="text-white/70">Bienvenido {residente?.nombre || 'Residente'}</p>
      </div>

      {/* Información del Residente */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <User size={20} /> Mis Datos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-white/80">
            <User size={18} className="text-white/50" />
            <span>{residente?.nombre}</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Mail size={18} className="text-white/50" />
            <span>{residente?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Phone size={18} className="text-white/50" />
            <span>{residente?.telefono || 'No registrado'}</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Home size={18} className="text-white/50" />
            <span>Unidad {unidad?.numero || 'No asignada'} - Torre {unidad?.torre || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Gastos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6 text-red-400" />
            <h3 className="text-white font-semibold">Deuda Pendiente</h3>
          </div>
          <p className="text-3xl font-bold text-white">${resumenGastos.pendiente.toLocaleString()}</p>
          <p className="text-white/40 text-sm mt-2">Gastos comunes por pagar</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-white font-semibold">Total Pagado</h3>
          </div>
          <p className="text-3xl font-bold text-white">${resumenGastos.pagado.toLocaleString()}</p>
          <p className="text-white/40 text-sm mt-2">Historial de pagos</p>
        </div>
      </div>

      {/* Últimos Gastos */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign size={18} /> Últimos Gastos Comunes
          </h3>
        </div>
        <div className="divide-y divide-white/10">
          {gastosComunes.length === 0 ? (
            <div className="text-center py-12 text-white/40">No hay gastos registrados para tu unidad</div>
          ) : (
            gastosComunes.slice(0, 5).map(g => (
              <div key={g.id} className="p-4 hover:bg-white/5 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{g.concepto || 'Gastos Comunes'}</p>
                    <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {g.periodo}
                      </span>
                      <span className="font-semibold text-white">${Number(g.monto_total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={'px-2 py-1 rounded-full text-xs ' + getEstadoColor(g.pagado === 1 ? 'pagado' : 'pendiente')}>
                    {g.pagado === 1 ? '✅ Pagado' : '⏳ Pendiente'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ResidenteDashboard;
