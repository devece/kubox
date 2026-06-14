import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, Home, Plus, Castle } from 'lucide-react';

const API = 'https://kubox-production-493b.up.railway.app/api';

function Reservas({ user }) {
  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    espacio_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
    unidad_id: '',
    tiene_extra: false
  });
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [horariosDisponibles, setHorariosDisponibles] = useState({ inicio: '', fin: '' });
  const [costoCalculado, setCostoCalculado] = useState(0);

  const esAdmin = user?.rol === 'admin';
  const esConserje = user?.rol === 'conserje';
  const esResidente = user?.rol === 'residente';
  const puedeCrear = esAdmin || esConserje || esResidente;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [reservasRes, espaciosRes, unidadesRes] = await Promise.all([
        axios.get(API + '/reservas'),
        axios.get(API + '/espacios'),
        axios.get(API + '/unidades')
      ]);
      setReservas(reservasRes.data);
      setEspacios(espaciosRes.data);
      setUnidades(unidadesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEspacioChange = (e) => {
    const id = parseInt(e.target.value);
    const espacio = espacios.find(esp => esp.id === id);
    setEspacioSeleccionado(espacio);
    setFormData({ ...formData, espacio_id: id, hora_inicio: '', hora_fin: '' });
    setHorariosDisponibles({ inicio: '', fin: '' });
    setCostoCalculado(0);
  };

  const handleFechaChange = (e) => {
    const fecha = e.target.value;
    setFormData({ ...formData, fecha, hora_inicio: '', hora_fin: '' });
    
    if (espacioSeleccionado && fecha) {
      const diaSemana = new Date(fecha).getDay();
      const esFestivo = (diaSemana === 5 || diaSemana === 6);
      
      if (esFestivo) {
        const inicio = espacioSeleccionado.horario_festivo_inicio || '10:00';
        const fin = espacioSeleccionado.horario_festivo_fin || '02:00';
        setHorariosDisponibles({ inicio, fin });
        setFormData(prev => ({ ...prev, hora_inicio: inicio, hora_fin: fin }));
      } else {
        const inicio = espacioSeleccionado.horario_semana_inicio || '10:00';
        const fin = espacioSeleccionado.horario_semana_fin || '22:00';
        setHorariosDisponibles({ inicio, fin });
        setFormData(prev => ({ ...prev, hora_inicio: inicio, hora_fin: fin }));
      }
    }
  };

  const calcularCosto = () => {
    if (!espacioSeleccionado || !formData.fecha) return 0;
    
    const diaSemana = new Date(formData.fecha).getDay();
    const esFestivo = (diaSemana === 5 || diaSemana === 6);
    
    let costo = 0;
    if (esFestivo) {
      costo = espacioSeleccionado.costo_dia_festivo || 0;
    } else {
      costo = espacioSeleccionado.costo_dia_semana || 0;
    }
    
    if (formData.tiene_extra) {
      costo += 5000;
    }
    
    return costo;
  };

  useEffect(() => {
    setCostoCalculado(calcularCosto());
  }, [formData.fecha, formData.tiene_extra, espacioSeleccionado]);

  const crearReserva = async () => {
    if (!formData.hora_inicio || !formData.hora_fin) {
      alert('Por favor selecciona una fecha para cargar los horarios');
      return;
    }
    
    try {
      const reservaData = {
        espacio_id: formData.espacio_id,
        fecha: formData.fecha,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        motivo: formData.motivo,
        unidad_id: formData.unidad_id,
        costo_total: costoCalculado,
        tiene_extra: formData.tiene_extra ? 1 : 0,
        monto_extra: formData.tiene_extra ? 5000 : 0,
        estado: 'pendiente'
      };
      
      await axios.post(API + '/reservas', reservaData);
      setModalAbierto(false);
      setFormData({ espacio_id: '', fecha: '', hora_inicio: '', hora_fin: '', motivo: '', unidad_id: '', tiene_extra: false });
      setEspacioSeleccionado(null);
      cargarDatos();
      alert('✅ Reserva creada correctamente. Pendiente de aprobación.');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const aprobarReserva = async (reservaId) => {
    await axios.put(API + '/reservas/' + reservaId, { estado: 'aprobada' });
    cargarDatos();
    alert('✅ Reserva aprobada');
  };

  const checkOut = async (reservaId, costoActual) => {
    const cobrarGarantia = confirm('¿Aplicar cobro de garantía?\n\nPresiona "Aceptar" para SÍ cobrar la garantía\nPresiona "Cancelar" para NO cobrar la garantía');
    const estado = cobrarGarantia ? 'garantia_cobrada' : 'finalizada';
    const fechaCheckOut = new Date().toISOString().split('T')[0];
    
    await axios.put(API + '/reservas/' + reservaId, { 
        estado, 
        check_out: fechaCheckOut, 
        garantia_aplicada: cobrarGarantia ? 1 : 0 
    });
    cargarDatos();
    const mensaje = cobrarGarantia 
        ? `✅ Garantía cobrada. Costo total final: $${(costoActual * 2).toLocaleString()}`
        : '✅ Check-out realizado sin cobro de garantía.';
    alert(mensaje);
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-300';
      case 'aprobada': return 'bg-green-500/20 text-green-300';
      case 'finalizada': return 'bg-gray-500/20 text-gray-300';
      case 'garantia_cobrada': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getEstadoTexto = (estado) => {
    switch(estado) {
      case 'pendiente': return '⏳ Pendiente';
      case 'aprobada': return '✅ Aprobada';
      case 'finalizada': return '📋 Finalizada';
      case 'garantia_cobrada': return '💰 Garantía Cobrada';
      default: return estado;
    }
  };

  const getEspacioNombre = (id) => {
    const espacio = espacios.find(e => e.id === id);
    return espacio?.nombre || 'Desconocido';
  };

  const getUnidadNumero = (id) => {
    const unidad = unidades.find(u => u.id === id);
    return unidad?.numero || 'N/A';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reservas de Espacios</h1>
          <p className="text-white/70">Gestiona y visualiza todas las reservas del condominio</p>
        </div>
        {puedeCrear && (
          <button onClick={() => setModalAbierto(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Plus size={20} /> Nueva Reserva
          </button>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Todas las reservas</h3>
        </div>
        <div className="divide-y divide-white/10">
          {reservas.length === 0 ? (
            <div className="text-center py-12 text-white/40">No hay reservas registradas</div>
          ) : (
            reservas.map(reserva => (
              <div key={reserva.id} className="p-4 hover:bg-white/5 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Home size={16} className="text-white/60" />
                      <span className="font-medium text-white">{getEspacioNombre(reserva.espacio_id)}</span>
                      <span className={'px-2 py-0.5 rounded-full text-xs ' + getEstadoColor(reserva.estado)}>
                        {getEstadoTexto(reserva.estado)}
                      </span>
                      {reserva.tiene_extra === 1 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 flex items-center gap-1">
                          🎈 Extra +$5,000
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {reserva.fecha}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {reserva.hora_inicio} - {reserva.hora_fin}</span>
                      <span className="flex items-center gap-1"><User size={14} /> Unidad {getUnidadNumero(reserva.unidad_id)}</span>
                    </div>
                    {reserva.motivo && <p className="text-white/40 text-sm mt-2">Motivo: {reserva.motivo}</p>}
                    <p className="text-green-400 text-sm mt-1 font-semibold">
                      💰 Costo total: ${(reserva.costo_total || 0).toLocaleString()}
                    </p>
                    {reserva.garantia_aplicada === 1 && (
                      <p className="text-red-400 text-sm mt-1">⚠️ Garantía cobrada</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(esAdmin || esConserje) && reserva.estado === 'pendiente' && (
                      <button onClick={() => aprobarReserva(reserva.id)} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/40 transition text-sm">
                        Aprobar
                      </button>
                    )}
                    {(esAdmin || esConserje) && reserva.estado === 'aprobada' && (
                      <button onClick={() => checkOut(reserva.id, reserva.costo_total)} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/40 transition text-sm">
                        Hacer Check-out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nueva Reserva</h2>
            <div className="space-y-3">
              <select className="w-full px-4 py-2 border rounded-xl" value={formData.espacio_id} onChange={handleEspacioChange} required>
                <option value="">Seleccionar espacio</option>
                {espacios.map(e => <option key={e.id} value={e.id}>{e.nombre} (Cap. {e.capacidad})</option>)}
              </select>
              
              <input type="date" className="w-full px-4 py-2 border rounded-xl" value={formData.fecha} onChange={handleFechaChange} required />
              
              {espacioSeleccionado && (
                <>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-sm text-gray-600">📅 Horario para esta fecha:</p>
                    <p className="font-medium">{horariosDisponibles.inicio} - {horariosDisponibles.fin}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="tiene_extra" checked={formData.tiene_extra} onChange={e => setFormData({...formData, tiene_extra: e.target.checked})} />
                    <label htmlFor="tiene_extra" className="flex items-center gap-1 text-gray-700">
                      🎈 Agregar Juegos Inflables / Adicionales (+$5,000)
                    </label>
                  </div>
                </>
              )}
              
              <textarea placeholder="Motivo de la reserva" className="w-full px-4 py-2 border rounded-xl" rows="2" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} />
              
              {costoCalculado > 0 && (
                <div className="bg-green-50 p-3 rounded-xl">
                  <p className="text-green-600 font-semibold">💰 Costo total: ${costoCalculado.toLocaleString()}</p>
                  <p className="text-green-500 text-xs">Este monto se agregará a tus gastos comunes del período</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl">Cancelar</button>
              <button onClick={crearReserva} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">Reservar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservas;