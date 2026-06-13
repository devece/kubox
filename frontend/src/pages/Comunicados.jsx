import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Eye, Trash2, Paperclip } from 'lucide-react';
import EditorTexto from '../components/EditorTexto';

const API = 'http://localhost:3001/api';

export default function Comunicados({ user }) {
  const [comunicados, setComunicados] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    destinatarios: 'todos',
    residentes_seleccionados: [],
    adjunto_url: '',
    adjunto_nombre: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [vistaDetalle, setVistaDetalle] = useState(null);

  const esAdmin = user?.rol === 'admin';
  const esComite = user?.rol === 'comite';
  const puedeEnviar = esAdmin || esComite;
  const esSoloLectura = !puedeEnviar;

  useEffect(() => {
    cargarComunicados();
    cargarResidentes();
  }, []);

  const cargarComunicados = async () => {
    try {
      const res = await axios.get(`${API}/comunicados`);
      setComunicados(res.data || []);
    } catch (error) {
      console.error('Error cargando comunicados:', error);
    }
  };

  const cargarResidentes = async () => {
    try {
      const res = await axios.get(`${API}/residentes`);
      setResidentes(res.data || []);
    } catch (error) {
      console.error('Error cargando residentes:', error);
    }
  };

  const enviarComunicado = async () => {
    if (!formData.titulo || !formData.contenido) {
      alert('Completa el título y el contenido');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        titulo: formData.titulo,
        contenido: formData.contenido,
        autor: user.email,
        autor_rol: user.rol,
        destinatarios: formData.destinatarios,
        residentes_seleccionados: formData.residentes_seleccionados,
        adjunto_url: formData.adjunto_url,
        adjunto_nombre: formData.adjunto_nombre
      };
      await axios.post(`${API}/comunicados`, payload);
      alert('✅ Comunicado enviado correctamente');
      setModalAbierto(false);
      setFormData({ 
        titulo: '', contenido: '', destinatarios: 'todos', 
        residentes_seleccionados: [], adjunto_url: '', adjunto_nombre: '' 
      });
      cargarComunicados();
    } catch (error) {
      alert('Error al enviar: ' + error.message);
    }
    setEnviando(false);
  };

  const eliminarComunicado = async (id) => {
    if (confirm('¿Eliminar este comunicado?')) {
      try {
        await axios.delete(`${API}/comunicados/${id}`);
        cargarComunicados();
        alert('✅ Comunicado eliminado');
      } catch (error) {
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  const getDestinatariosTexto = (destinatarios) => {
    try {
      const parsed = typeof destinatarios === 'string' ? JSON.parse(destinatarios) : destinatarios;
      if (parsed.tipo === 'todos') return 'Todos los residentes';
      if (parsed.tipo === 'morosos') return 'Solo residentes morosos';
      return `${parsed.ids?.length || 0} residentes seleccionados`;
    } catch {
      return 'Todos los residentes';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Comunicados</h1>
          <p className="text-white/70">Gestiona la comunicación con los residentes</p>
        </div>
        {puedeEnviar && (
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition flex items-center gap-2"
          >
            <Send size={18} /> Nuevo Comunicado
          </button>
        )}
      </div>

      {esSoloLectura && (
        <div className="bg-yellow-500/20 text-yellow-200 p-3 rounded-xl text-sm flex items-center gap-2 mb-4">
          <Eye size={16} /> Modo solo lectura - No puedes enviar comunicados
        </div>
      )}

      <div className="space-y-4">
        {comunicados.length === 0 ? (
          <div className="text-center py-12 text-white/40">No hay comunicados aún</div>
        ) : (
          comunicados.map(c => (
            <div key={c.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{c.titulo}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40">{new Date(c.fecha).toLocaleString()}</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                        {c.autor_rol === 'admin' ? 'Administración' : 'Comité'}
                      </span>
                      <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">
                        {getDestinatariosTexto(c.destinatarios)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setVistaDetalle(vistaDetalle === c.id ? null : c.id)}
                      className="text-blue-400 hover:text-blue-300 transition text-sm"
                    >
                      {vistaDetalle === c.id ? 'Ocultar' : 'Ver detalles'}
                    </button>
                    {puedeEnviar && (
                      <button onClick={() => eliminarComunicado(c.id)} className="text-red-400 hover:text-red-300 transition">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {vistaDetalle === c.id && (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: c.contenido }} />
                    {c.adjunto_url && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <a 
                          href={c.adjunto_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <Paperclip size={14} />
                          📎 Adjunto: {c.adjunto_nombre || 'Descargar archivo'}
                        </a>
                      </div>
                    )}
                    <div className="mt-3 text-xs text-white/40 border-t border-white/10 pt-3">
                      Enviado por: {c.autor} ({c.autor_rol === 'admin' ? 'Administrador' : 'Comité'})
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nuevo Comunicado */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nuevo Comunicado</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título del comunicado"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                value={formData.titulo}
                onChange={e => setFormData({...formData, titulo: e.target.value})}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinatarios</label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  value={formData.destinatarios}
                  onChange={e => setFormData({...formData, destinatarios: e.target.value, residentes_seleccionados: []})}
                >
                  <option value="todos">Todos los residentes</option>
                  <option value="morosos">Solo residentes morosos</option>
                  <option value="seleccionados">Seleccionar residentes específicos</option>
                </select>
              </div>

              {formData.destinatarios === 'seleccionados' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar residentes</label>
                  <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto">
                    {residentes.map(r => (
                      <label key={r.id} className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          value={r.id}
                          checked={formData.residentes_seleccionados.includes(r.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                residentes_seleccionados: [...formData.residentes_seleccionados, r.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                residentes_seleccionados: formData.residentes_seleccionados.filter(id => id !== r.id)
                              });
                            }
                          }}
                        />
                        <span className="text-sm">{r.nombre} - Unidad {r.unidad_numero || '?'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <EditorTexto
                  value={formData.contenido}
                  onChange={(contenido) => setFormData({...formData, contenido})}
                  onAdjuntoChange={(adjunto) => setFormData({...formData, adjunto_url: adjunto.url, adjunto_nombre: adjunto.nombre})}
                />
              </div>

              {formData.adjunto_nombre && (
                <div className="bg-blue-50 p-2 rounded-xl text-sm text-blue-700 flex items-center gap-2">
                  <Paperclip size={14} />
                  Archivo adjunto: {formData.adjunto_nombre}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setModalAbierto(false)} className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition">
                  Cancelar
                </button>
                <button onClick={enviarComunicado} disabled={enviando} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl">
                  {enviando ? 'Enviando...' : 'Enviar Comunicado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}