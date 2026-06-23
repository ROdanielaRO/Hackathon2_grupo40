import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-500/20 text-indigo-200' : 'text-zinc-400 hover:text-zinc-100'}`

export function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <span className="mr-4 font-semibold tracking-tight text-indigo-300">TropelCare</span>
          <nav className="flex gap-1">
            <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
            <NavLink to="/tropels" className={link}>Tropeles</NavLink>
            <NavLink to="/feed" className={link}>Señales</NavLink>
            <NavLink to="/sectors" className={link}>Sectores</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-zinc-400">
            <span>{user?.teamCode}</span>
            <button onClick={logout} className="rounded-lg border border-zinc-700 px-3 py-1.5 hover:bg-zinc-800">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
