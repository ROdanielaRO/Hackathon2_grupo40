import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/api'

export function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [teamCode, setTeamCode] = useState('')
  const [email, setEmail] = useState('operator@tuckersoft.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (user) return <Navigate to={from} replace />

  async function onSubmit() {
    setLoading(true)
    setError(null)
    try {
      await login({ teamCode, email, password })
      navigate(from, { replace: true })
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="text-lg font-semibold text-indigo-300">TropelCare Control Room</h1>
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="TEAM-0XX" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} />
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()} />
        </div>
        {error && <p className="text-sm text-rose-400">⚠ {error}</p>}
        <button
          disabled={loading || !teamCode || !password}
          onClick={onSubmit}
          className="w-full rounded-lg bg-indigo-500 py-2 font-medium text-white disabled:opacity-50">
          {loading ? 'Entrando…' : 'Encender consola'}
        </button>
      </div>
    </div>
  )
}
