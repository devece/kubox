import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, CreditCard, ClipboardList, Megaphone } from 'lucide-react'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/unidades', icon: Building2, label: 'Unidades' },
    { path: '/residentes', icon: Users, label: 'Residentes' },
    { path: '/gastos', icon: CreditCard, label: 'Gastos' },
    { path: '/solicitudes', icon: ClipboardList, label: 'Solicitudes' },
    { path: '/avisos', icon: Megaphone, label: 'Avisos' },
  ]

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-900 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
        <div className="p-4">
          <div className="mb-8">
            <h1 className={`text-xl font-bold text-white ${!sidebarOpen && 'lg:hidden'}`}>
              Kubox
            </h1>
            {sidebarOpen && (
              <p className="text-xs text-gray-400 mt-1">Administración de Edificios</p>
            )}
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                  ${!sidebarOpen && 'lg:justify-center'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className={`${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar