import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'
import { getToken, setToken, clearToken } from '../lib/token'
import type { User, LoginRequest } from '../lib/types'

interface AuthState {
  user: User | null
  restoring: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [restoring, setRestoring] = useState(true)

  // Restaurar sesión al cargar / recargar (Checkpoint 1)
  useEffect(() => {
    const controller = new AbortController()
    if (!getToken()) { setRestoring(false); return }
    api.me(controller.signal)
      .then((u) => setUser(u))
      .catch(() => { clearToken(); setUser(null) })
      .finally(() => setRestoring(false))
    return () => controller.abort()
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await api.login(data)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, restoring, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
