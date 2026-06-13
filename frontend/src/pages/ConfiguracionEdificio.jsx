import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, CreditCard, Phone, Mail, Save, Edit } from 'lucide-react';

const API = 'http://localhost:3001/api';

function ConfiguracionEdificio() {
  const [config, setConfig] = useState({
    nombre_edificio: '',
    banco: '',
    tipo_cuenta: '',
    numero_cuenta: '',
    rut_empresa: '',
    email_contacto: '',
    telefono_contacto: '',
    instrucciones_pago: ''
  });
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const res = await axios.get(API + '/config-edificio');
      if (res.data) setConfig(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracion = async () => {
    try {
      await axios.put(API + '/config-edificio', config);
      setEditando(false);
      alert('✅ Configuración guardada correctamente');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (cargando) {
    return <div className="text-white text-center py-12">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuración del Edificio</h1>
          <p className="text-white/70">Datos bancarios y contacto para pagos</p>
        </div>
        {!editando && (
          <button onClick={() => setEditando(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2">
            <Edit size={20} /> Editar
          </button>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm block mb-1">Nombre del Edificio</label>
              {editando ? (
                <input type="text" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.nombre_edificio} onChange={e => setConfig({...config, nombre_edificio: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{config.nombre_edificio || 'No configurado'}</p>
              )}
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">RUT Empresa</label>
              {editando ? (
                <input type="text" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.rut_empresa} onChange={e => setConfig({...config, rut_empresa: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{config.rut_empresa || 'No configurado'}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 my-4"></div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><CreditCard size={20} /> Datos Bancarios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm block mb-1">Banco</label>
              {editando ? (
                <input type="text" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.banco} onChange={e => setConfig({...config, banco: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{config.banco || 'No configurado'}</p>
              )}
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">Tipo de Cuenta</label>
              {editando ? (
                <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.tipo_cuenta} onChange={e => setConfig({...config, tipo_cuenta: e.target.value})}>
                  <option value="">Seleccionar</option>
                  <option value="Cuenta Corriente">Cuenta Corriente</option>
                  <option value="Cuenta Vista">Cuenta Vista</option>
                  <option value="Cuenta Rut">Cuenta Rut</option>
                </select>
              ) : (
                <p className="text-white text-lg">{config.tipo_cuenta || 'No configurado'}</p>
              )}
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">Número de Cuenta</label>
              {editando ? (
                <input type="text" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.numero_cuenta} onChange={e => setConfig({...config, numero_cuenta: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{config.numero_cuenta || 'No configurado'}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 my-4"></div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><Phone size={20} /> Contacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm block mb-1">Teléfono de Contacto</label>
              {editando ? (
                <input type="text" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.telefono_contacto} onChange={e => setConfig({...config, telefono_contacto: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{config.telefono_contacto || 'No configurado'}</p>
              )}
            </div>
            <div>
              <label className="text-white/70 text-sm block mb-1">Email de Contacto</label>
              {editando ? (
                <input type="email" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.email_contacto} onChange={e => setConfig({...config, email_contacto: e.target.value})} />
              ) : (
                <p className="text-white text-lg">{config.email_contacto || 'No configurado'}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm block mb-1">Instrucciones de Pago</label>
            {editando ? (
              <textarea rows="3" className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white" value={config.instrucciones_pago} onChange={e => setConfig({...config, instrucciones_pago: e.target.value})} />
            ) : (
              <p className="text-white/70">{config.instrucciones_pago || 'No configurado'}</p>
            )}
          </div>

          {editando && (
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setEditando(false)} className="px-4 py-2 bg-gray-500/20 text-white rounded-xl hover:bg-gray-500/40 transition">Cancelar</button>
              <button onClick={guardarConfiguracion} className="px-4 py-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/40 transition flex items-center gap-2">
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfiguracionEdificio;
