import React from 'react'
import { useEdificio } from '../context/EdificioContext'
import { Building2, Users, DollarSign, AlertCircle, TrendingUp, Home, CreditCard, Calendar } from 'lucide-react'

const Dashboard = () => {
  const { datos } = useEdificio()
  
  const totalUnidades = datos.unidades.length
  const unidadesOcupadas = datos.unidades.filter(u => u.ocupada).length
  const pagosPendientes = datos.pagos.filter(p => p.estado === 'pendiente').length
  const recaudado = datos.pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0)
  const solicitudesAbiertas = datos.solicitudes.filter(s => s.estado === 'abierta').length
  const solicitudesUrgentes = datos.solicitudes.filter(s => s.urgente && s.estado === 'abierta').length
  const avisosActivos = datos.avisos.length

  const estadisticas = [
    { titulo: 'Unidades', valor: totalUnidades, subtitulo: `${unidadesOcupadas} ocupadas`, icono: Building2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
    { titulo: 'Pagos Pendientes', valor: pagosPendientes, subtitulo: `$${recaudado.toLocaleString()} recaudado`, icono: CreditCard, color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50' },
    { titulo: 'Solicitudes', valor: solicitudesAbiertas, subtitulo: `${solicitudesUrgentes} urgentes`, icono: AlertCircle, color: 'from-red-500 to-red-600', bg: 'bg-red-50' },
    { titulo: 'Avisos Activos', valor: avisosActivos, subtitulo: 'publicados', icono: Megaphone, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
  ]

  const solicitudesRecientes = [...datos.solicitudes]
    .filter(s => s.estado === 'abierta')
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  const avisosRecientes = [...datos.avisos]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5)

  return (
    <div>
      {/* Header del dashboard */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Bienvenido de vuelta. Aquí está el resumen de tu condominio</p>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {estadisticas.map((stat, index) => (
          <div key={index} className={`stat-card border-l-4 border-l-${stat.color.split('-')[1]}-500 hover:shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.titulo}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.valor}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitulo}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icono className={`w-6 h-6 text-${stat.color.split('-')[1]}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de tendencia (simulado) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ingresos Mensuales</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="h-48 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <p className="text-gray-400">Gráfico de ingresos próximamente</p>
          </div>
        </div>
        
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Resumen Rápido</h3>
            <Home className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ocupación</span>
              <span className="font-semibold text-gray-800">{Math.round((unidadesOcupadas / totalUnidades) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(unidadesOcupadas / totalUnidades) * 100}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-gray-600">Recaudación</span>
              <span className="font-semibold text-gray-800">${recaudado.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendiente</span>
              <span className="font-semibold text-yellow-600">${(pagosPendientes * 250000).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Listas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes recientes */}
        <div className="card-glass overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Solicitudes Recientes</h2>
          </div>
          <div className="p-4">
            {solicitudesRecientes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay solicitudes abiertas</p>
            ) : (
              <ul className="space-y-3">
                {solicitudesRecientes.map(solicitud => (
                  <li key={solicitud.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <div>
                      <p className={`font-medium ${solicitud.urgente ? 'text-red-600' : 'text-gray-800'}`}>
                        {solicitud.titulo}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Unidad {solicitud.unidad} · {solicitud.fecha}</p>
                    </div>
                    {solicitud.urgente && (
                      <span className="badge-urgent">Urgente</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Últimos avisos */}
        <div className="card-glass overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Últimos Avisos</h2>
          </div>
          <div className="p-4">
            {avisosRecientes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay avisos publicados</p>
            ) : (
              <ul className="space-y-3">
                {avisosRecientes.map(aviso => (
                  <li key={aviso.id} className="p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-xl">
                    <p className="font-medium text-gray-800">{aviso.titulo}</p>
                    <p className="text-xs text-gray-400 mt-1">{aviso.fecha}</p>
                    <p className="text-sm text-gray-600 mt-2">{aviso.descripcion}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard