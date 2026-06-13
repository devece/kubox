import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Save, AlertCircle, CheckCircle, Building2 } from 'lucide-react';

const API = 'http://localhost:3001/api';

export default function ConfiguracionEmail() {
  const [config, setConfig] = useState({ email_user: '', email_pass: '' });
  const [mensaje, setMensaje] = useState('');
  const [probando, setProbando] = useState(false);
  const [configurado, setConfigurado] = useState(false);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    try {
      const res = await axios.get(`${API}/email-config`);
      if (res.data) {
        setConfig({ email_user: res.data.email_user || '', email_pass: '' });
        setConfigurado(!!res.data.email_user);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const guardarConfig = async () => {
    if (!config.email_user || !config.email_pass) {
      setMensaje('❌ Completa ambos campos');
      setTimeout(() => setMensaje(''), 3000);
      return;
    }

    try {
      await axios.post(`${API}/email-config`, config);
      setMensaje('✅ Configuración guardada correctamente');
      setConfigurado(true);
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error al guardar: ' + error.message);
    }
  };

  const probarEnvio = async () => {
    if (!config.email_user) {
      setMensaje('❌ Configura primero tu correo');
      return;
    }
    setProbando(true);
    try {
      await axios.post(`${API}/email-test`, { email: config.email_user });
      setMensaje('✅ Email de prueba enviado correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      setMensaje('❌ Error al enviar prueba: ' + error.message);
    }
    setProbando(false);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Building2 size={28} /> Configuración del Condominio
        </h1>
        <p className="text-white/70">Configura el correo corporativo para enviar notificaciones a los residentes</p>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-xl text-center ${mensaje.includes('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {mensaje}
        </div>
      )}

      {configurado && (
        <div className="bg-green-500/20 text-green-300 p-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} /> Correo configurado: <strong>{config.email_user}</strong>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1 flex items-center gap-2">
              <Mail size={16} /> Correo electrónico corporativo
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="cobros@tucondominio.cl"
              value={config.email_user}
              onChange={e => setConfig({...config, email_user: e.target.value})}
            />
            <p className="text-xs text-white/40 mt-1">
              Desde este correo se enviarán las notificaciones a los residentes
            </p>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-1 flex items-center gap-2">
              🔐 Contraseña de aplicación
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contraseña de aplicación"
              value={config.email_pass}
              onChange={e => setConfig({...config, email_pass: e.target.value})}
            />
            <p className="text-xs text-white/40 mt-1">
              Para Gmail, genera una <strong>"Contraseña de aplicación"</strong> en tu cuenta de Google
            </p>
          </div>

          <div className="bg-blue-500/20 rounded-xl p-3 text-sm text-blue-200">
            <p className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5" />
              <span>
                <strong>📧 Configuración para correo corporativo:</strong><br />
                1. Usa un correo específico del condominio (ej: cobros@edificiocentral.cl)<br />
                2. Para Gmail, activa verificación en dos pasos y genera contraseña de aplicación<br />
                3. Para Outlook/Hotmail, usa tu contraseña normal<br />
                4. Prueba la configuración con el botón "Probar envío"
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={guardarConfig}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              <Save size={18} /> Guardar configuración
            </button>
            <button
              onClick={probarEnvio}
              disabled={probando}
              className="bg-gray-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-700 transition"
            >
              {probando ? 'Enviando...' : '📧 Probar envío'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-3">📬 Notificaciones automáticas</h3>
        <div className="space-y-2 text-white/70 text-sm">
          <p>✅ <strong>Nuevo gasto común</strong> → Se envía a todos los residentes</p>
          <p>✅ <strong>Pago registrado</strong> → Se envía confirmación al residente</p>
          <p>✅ <strong>Comunicados</strong> → Se envían a los destinatarios seleccionados</p>
          <p>✅ <strong>Recordatorio de vencimiento</strong> → Próximamente</p>
        </div>
      </div>

      <div className="bg-yellow-500/20 rounded-xl p-3 text-sm text-yellow-200">
        <p className="flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5" />
          <span>
            <strong>💡 Recomendación:</strong><br />
            Crea un correo exclusivo para el condominio como <strong>cobros@tucodominio.cl</strong> o <strong>administracion@tucodominio.cl</strong>.
            Esto dará una imagen más profesional a los residentes.
          </span>
        </p>
      </div>
    </div>
  );
}