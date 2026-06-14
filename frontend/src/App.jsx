import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Building2, Users, CreditCard, LogOut, DollarSign, Home, Menu, X, Calendar, Shield, Eye, ClipboardList, Send, User, Mail, Wrench, Package, AlertCircle, BarChart3, PieChart, Activity, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

import Gastos from './pages/Gastos';
import ResidenteDashboard from './pages/ResidenteDashboard';
import Espacios from './pages/Espacios';
import Reservas from './pages/Reservas';
import Conserjeria from './pages/Conserjeria';
import ConserjeDashboard from './pages/ConserjeDashboard';
import Comunicados from './pages/Comunicados';
import MisDatos from './pages/MisDatos';
import VisitasResidente from './pages/VisitasResidente';
import ComunicadosResidente from './pages/ComunicadosResidente';
import Mantenimiento from './pages/Mantenimiento';
import GastosComunesAdmin from './pages/GastosComunesAdmin';
import EncomiendasResidente from './pages/EncomiendasResidente';
import GastosComunesResidente from './pages/GastosComunesResidente';
import Garantias from './pages/Garantias';
import Multas from './pages/Multas';
import ConfiguracionEdificio from './pages/ConfiguracionEdificio';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const API = 'https://kubox-production-493b.up.railway.app/api';

function Dashboard({ esSoloLectura = false }) {
  const [dashboard, setDashboard] = useState({});
  const [ingresosData, setIngresosData] = useState([]);
  const [gastosCategoria, setGastosCategoria] = useState([]);
  const [morosidadData, setMorosidadData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [dash, ingresos, gastos, morosidad] = await Promise.all([
          axios.get(API + '/dashboard-stats'),
          axios.get(API + '/grafico-ingresos'),
          axios.get(API + '/grafico-gastos-categoria'),
          axios.get(API + '/grafico-morosidad')
        ]);
        setDashboard(dash.data);
        setIngresosData(ingresos.data.reverse());
        setGastosCategoria(gastos.data);
        setMorosidadData(morosidad.data.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const ingresosChartData = {
    labels: ingresosData.map(i => i.periodo),
    datasets: [
      { label: 'Ingresos Recaudados', data: ingresosData.map(i => i.total_recaudado || 0), backgroundColor: 'rgba(34, 197, 94, 0.5)', borderColor: 'rgb(34, 197, 94)', borderWidth: 2 },
      { label: 'Deuda Pendiente', data: ingresosData.map(i => (i.morosos || 0) * 100000), backgroundColor: 'rgba(239, 68, 68, 0.5)', borderColor: 'rgb(239, 68, 68)', borderWidth: 2 }
    ]
  };

  const gastosChartData = {
    labels: gastosCategoria.map(i => i.categoria),
    datasets: [{ data: gastosCategoria.map(i => i.total), backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'], borderWidth: 0 }]
  };

  const morosidadChartData = {
    labels: morosidadData.map(i => i.periodo),
    datasets: [
      { label: 'Pagados', data: morosidadData.map(i => i.pagados || 0), borderColor: 'rgb(34, 197, 94)', backgroundColor: 'rgba(34, 197, 94, 0.1)', fill: true, tension: 0.4 },
      { label: 'Morosos', data: morosidadData.map(i => i.morosos || 0), borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
    ]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'white', font: { size: 11 } } } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } }, x: { grid: { display: false }, ticks: { color: 'white' } } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: 'white', font: { size: 10 } } } } };

  const stats = [
    { title: 'Total Unidades', value: dashboard.total_unidades || 0, subtitle: (dashboard.ocupadas || 0) + ' ocupadas', icon: Home },
    { title: 'Residentes', value: dashboard.total_residentes || 0, subtitle: 'registrados', icon: Users },
    { title: 'Morosos', value: dashboard.morosos || 0, subtitle: 'con deuda', icon: AlertCircle },
    { title: 'Recaudado Mes', value: '$' + (dashboard.recaudado_mes || 0).toLocaleString(), subtitle: 'este mes', icon: DollarSign }
  ];

  if (cargando) return <div className="text-white text-center py-12">Cargando dashboard...</div>;

  return (
    <div className="space-y-8">
      {esSoloLectura && <div className="bg-yellow-500/20 text-yellow-200 p-3 rounded-xl text-sm flex items-center gap-2"><Eye size={16} /> Modo solo lectura - No puedes realizar cambios</div>}
      <div className="mb-8"><h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1><p className="text-white/70">Bienvenido. Aqui esta el resumen del condominio</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4"><stat.icon className="w-8 h-8 text-white" /><TrendingUp className="w-5 h-5 text-white/50" /></div>
            <h3 className="text-white/70 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            <p className="text-xs text-white/40 mt-2">{stat.subtitle}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><div className="flex items-center gap-2 mb-4"><BarChart3 className="w-5 h-5 text-white" /><h3 className="text-lg font-semibold text-white">Ingresos Mensuales</h3></div><div className="h-64">{ingresosData.length > 0 ? <Bar data={ingresosChartData} options={chartOptions} /> : <div className="h-full flex items-center justify-center text-white/50">No hay datos de ingresos</div>}</div></div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><div className="flex items-center gap-2 mb-4"><PieChart className="w-5 h-5 text-white" /><h3 className="text-lg font-semibold text-white">Distribucion de Gastos</h3></div><div className="h-64">{gastosCategoria.length > 0 ? <Doughnut data={gastosChartData} options={doughnutOptions} /> : <div className="h-full flex items-center justify-center text-white/50">No hay datos de gastos</div>}</div></div>
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><div className="flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-white" /><h3 className="text-lg font-semibold text-white">Evolucion de Morosidad</h3></div><div className="h-80">{morosidadData.length > 0 ? <Line data={morosidadChartData} options={chartOptions} /> : <div className="h-full flex items-center justify-center text-white/50">No hay datos de morosidad</div>}</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><p className="text-white/50 text-sm">Deuda Total</p><p className="text-2xl font-bold text-white">${(dashboard.deuda_total || 0).toLocaleString()}</p></div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><p className="text-white/50 text-sm">Recaudado Total</p><p className="text-2xl font-bold text-white">${(dashboard.recaudado_total || 0).toLocaleString()}</p></div>
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><p className="text-white/50 text-sm">Tasa de Ocupación</p><p className="text-2xl font-bold text-white">{dashboard.total_unidades ? Math.round((dashboard.ocupadas / dashboard.total_unidades) * 100) : 0}%</p></div>
      </div>
    </div>
  );
}

function Unidades({ soloLectura = false }) {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API + '/unidades').then(r => {
      setUnidades(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white">Cargando unidades...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">Unidades</h1>
      <div className="bg-white/10 rounded-xl p-4">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/20">
              <th className="p-2 text-left">Número</th>
              <th className="p-2 text-left">Torre</th>
              <th className="p-2 text-left">Residente</th>
            </tr>
          </thead>
          <tbody>
            {unidades.map(u => (
              <tr key={u.id} className="border-b border-white/10">
                <td className="p-2">{u.numero}</td>
                <td className="p-2">{u.torre || '-'}</td>
                <td className="p-2">{u.residente_nombre || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResidentesLista({ soloLectura = false }) {
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API + '/residentes').then(r => {
      setResidentes(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white">Cargando residentes...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">Residentes</h1>
      <div className="bg-white/10 rounded-xl p-4">
        <table className="w-full text-white">
          <thead>
            <tr className="border-b border-white/20">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {residentes.map(r => (
              <tr key={r.id} className="border-b border-white/10">
                <td className="p-2">{r.nombre}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{r.telefono || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(API + '/login', { email, password });
      if (res.data && res.data.rol) onLogin(res.data);
      else setError('Credenciales incorrectas');
    } catch { setError('Error al conectar con el servidor'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-96 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-white font-bold text-2xl">K</span></div>
          <h1 className="text-3xl font-bold text-white">Kubox</h1>
          <p className="text-white/60 text-sm mt-1">Administracion de Edificios</p>
        </div>
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-xl mb-4 text-center text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 mb-3 focus:outline-none focus:ring-2 focus:ring-white/30" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
          <input type="password" placeholder="Contraseña" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 mb-4" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
        <div className="mt-4 text-center text-xs text-white/40 space-y-1">
          <p className="font-semibold text-white/60 mb-1">Credenciales de prueba:</p>
          <p>Admin: admin@kubox.com / admin123</p>
          <p>Comité: comite@kubox.com / 123456</p>
          <p>Conserje: conserje@kubox.com / conserje123</p>
          <p>Residente: juan@kubox.com / juan123</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kubox_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [vista, setVista] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = (userData) => {
    localStorage.setItem('kubox_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('kubox_user');
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const esAdmin = user.rol === 'admin';
  const esConserje = user.rol === 'conserje';
  const esResidente = user.rol === 'residente';

  const getMenuItems = () => {
    if (esAdmin) return [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'unidades', icon: Building2, label: 'Unidades' },
      { id: 'residentes', icon: Users, label: 'Residentes' },
      { id: 'gastos', icon: CreditCard, label: 'Gastos' },
      { id: 'gastos-comunes', icon: DollarSign, label: 'Gastos Comunes' },
      { id: 'multas', icon: AlertCircle, label: 'Multas' },
      { id: 'espacios', icon: Home, label: 'Espacios' },
      { id: 'reservas', icon: Calendar, label: 'Reservas' },
      { id: 'conserjeria', icon: ClipboardList, label: 'Conserjería' },
      { id: 'comunicados', icon: Send, label: 'Comunicados' },
      { id: 'configuracion', icon: Building2, label: 'Configuración' },
      { id: 'mantenimiento', icon: Wrench, label: 'Mantenimiento' }
    ];
    if (esConserje) return [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { id: 'unidades', icon: Building2, label: 'Unidades' },
      { id: 'residentes', icon: Users, label: 'Residentes' },
      { id: 'reservas', icon: Calendar, label: 'Reservas' },
      { id: 'garantias', icon: Shield, label: 'Garantías' },
      { id: 'conserjeria', icon: ClipboardList, label: 'Conserjería' },
      { id: 'mantenimiento', icon: Wrench, label: 'Mantenimiento' }
    ];
    return [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Mi Dashboard' },
      { id: 'mis-datos', icon: User, label: 'Mis Datos' },
      { id: 'gastos-comunes', icon: DollarSign, label: 'Gastos Comunes' },
      { id: 'reservas', icon: Calendar, label: 'Reservas' },
      { id: 'visitas', icon: Users, label: 'Visitas' },
      { id: 'encomiendas', icon: Package, label: 'Mis Encomiendas' },
      { id: 'comunicados', icon: Mail, label: 'Comunicados' }
    ];
  };

  const menuItems = getMenuItems();

  const renderContent = () => {
    if (esAdmin) {
      if (vista === 'dashboard') return <Dashboard />;
      if (vista === 'unidades') return <Unidades />;
      if (vista === 'residentes') return <ResidentesLista />;
      if (vista === 'gastos') return <Gastos user={user} soloLectura={false} />;
      if (vista === 'gastos-comunes') return <GastosComunesAdmin />;
      if (vista === 'multas') return <Multas user={user} />;
      if (vista === 'espacios') return <Espacios />;
      if (vista === 'reservas') return <Reservas user={user} />;
      if (vista === 'conserjeria') return <Conserjeria user={user} />;
      if (vista === 'comunicados') return <Comunicados user={user} />;
      if (vista === 'configuracion') return <ConfiguracionEdificio />;
      if (vista === 'mantenimiento') return <Mantenimiento user={user} soloLectura={false} />;
    }
    if (esConserje) {
      if (vista === 'dashboard') return <ConserjeDashboard />;
      if (vista === 'unidades') return <Unidades soloLectura={true} />;
      if (vista === 'residentes') return <ResidentesLista soloLectura={true} />;
      if (vista === 'reservas') return <Reservas user={user} />;
      if (vista === 'garantias') return <Garantias user={user} />;
      if (vista === 'conserjeria') return <Conserjeria user={user} />;
      if (vista === 'mantenimiento') return <Mantenimiento user={user} soloLectura={true} />;
    }
    if (esResidente) {
      if (vista === 'dashboard') return <ResidenteDashboard residenteEmail={user.email} />;
      if (vista === 'mis-datos') return <MisDatos residenteEmail={user.email} />;
      if (vista === 'gastos-comunes') return <GastosComunesResidente residenteEmail={user.email} />;
      if (vista === 'reservas') return <Reservas user={user} />;
      if (vista === 'visitas') return <VisitasResidente residenteEmail={user.email} />;
      if (vista === 'encomiendas') return <EncomiendasResidente residenteEmail={user.email} />;
      if (vista === 'comunicados') return <ComunicadosResidente residenteEmail={user.email} />;
    }
    return <Dashboard />;
  };

  return (
    <div className="flex h-screen">
      <aside className={`bg-gray-900/95 backdrop-blur-xl border-r border-white/10 ${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 relative z-10`}>
        <div className="flex flex-col h-full">
          <div className={`p-6 flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center"><span className="text-white font-bold text-xl">K</span></div>
            {sidebarOpen && <div><h1 className="text-white font-bold text-xl">Kubox</h1><p className="text-white/50 text-xs capitalize">{user.rol}</p></div>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-20 bg-gray-800 rounded-full p-1 text-white/70 hover:text-white">{sidebarOpen ? <X size={16} /> : <Menu size={16} />}</button>
          <nav className="flex-1 px-4 space-y-2 mt-8">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setVista(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${vista === item.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'} ${!sidebarOpen && 'justify-center'}`}>
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition ${!sidebarOpen && 'justify-center'}`}>
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">Salir</span>}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;