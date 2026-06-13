import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CheckCircle, XCircle, Building2, CreditCard, Phone, Mail, Info } from 'lucide-react';

const API = 'http://localhost:3001/api';

function GastosComunesResidente({ residenteEmail }) {
  const [gastos, setGastos] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagado, setPagado] = useState(0);
  const [pendiente, setPendiente] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [configEdificio, setConfigEdificio] = useState({});

  useEffect(() => {
    if (residenteEmail) {
      cargarGastos();
      cargarConfiguracion();
    }
  }, [residenteEmail]);

  const cargarConfiguracion = async () => {
    try {
      const res = await axios.get(API + '/config-edificio');
      setConfigEdificio(res.data);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const cargarGastos = async () => {
    try {
      const resResidente = await axios.get(API + '/residentes/email/' + residenteEmail);
      const residenteId = resResidente.data.id;
      const resUnidad = await axios.get(API + '/unidades/residente/' + residenteId);
      const unidadId = resUnidad.data.id;
      const resGastos = await axios.get(API + '/gastos-comunes/unidad/' + unidadId);
      const datos = resGastos.data;
      setGastos(datos);
      
      let sumaTotal = 0;
      let sumaPagado = 0;
      datos.forEach(g => {
        const monto = Number(g.monto_total);
        sumaTotal += monto;
        if (g.pagado === 1) {
          sumaPagado += monto;
        }
      });
      setTotal(sumaTotal);
      setPagado(sumaPagado);
      setPendiente(sumaTotal - sumaPagado);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gastos Comunes</h1>
        <p className="text-white/70">Detalle de tus gastos comunes por período</p>
      </div>

      {/* Datos de transferencia */}
      {configEdificio.banco && (
        <div className="bg-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard size={20} /> Datos para Transferencia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/50">Banco</p>
              <p className="text-white font-medium">{configEdificio.banco}</p>
            </div>
            <div>
              <p className="text-white/50">Tipo de Cuenta</p>
              <p className="text-white font-medium">{configEdificio.tipo_cuenta}</p>
            </div>
            <div>
              <p className="text-white/50">Número de Cuenta</p>
              <p className="text-white font-medium">{configEdificio.numero_cuenta}</p>
            </div>
            <div>
              <p className="text-white/50">RUT Empresa</p>
              <p className="text-white font-medium">{configEdificio.rut_empresa}</p>
            </div>
            <div>
              <p className="text-white/50">Contacto</p>
              <p className="text-white font-medium">{configEdificio.telefono_contacto}</p>
            </div>
            <div>
              <p className="text-white/50">Email</p>
              <p className="text-white font-medium">{configEdificio.email_contacto}</p>
            </div>
          </div>
          {configEdificio.instrucciones_pago && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg flex items-start gap-2">
              <Info size={18} className="text-blue-300 mt-0.5" />
              <p className="text-blue-200 text-sm">{configEdificio.instrucciones_pago}</p>
            </div>
          )}
        </div>
      )}

      {/* Tarjetas de totales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <DollarSign className="w-8 h-8 text-white mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Total Gastos</h3>
          <p className="text-3xl font-bold text-white mt-1">${total.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Total Pagado</h3>
          <p className="text-3xl font-bold text-white mt-1">${pagado.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <XCircle className="w-8 h-8 text-red-400 mb-4" />
          <h3 className="text-white/70 text-sm font-medium">Pendiente</h3>
          <p className="text-3xl font-bold text-white mt-1">${pendiente.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-white/70 text-sm">
                <th className="p-4 text-left">Período</th>
                <th className="p-4 text-left">Concepto</th>
                <th className="p-4 text-left">Monto</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Vencimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {gastos.map(g => (
                <tr key={g.id} className="text-white/80 hover:bg-white/5 transition">
                  <td className="p-4">{g.periodo || '-'}</td>
                  <td className="p-4">{g.concepto || 'Gastos Comunes'}</td>
                  <td className="p-4 font-semibold text-green-400">${Number(g.monto_total || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={g.pagado === 1 ? 'px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-300' : 'px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300'}>
                      {g.pagado === 1 ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-white/60">{g.fecha_vencimiento || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {gastos.length === 0 && (
            <div className="text-center py-12 text-white/40">No hay gastos registrados</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GastosComunesResidente;
