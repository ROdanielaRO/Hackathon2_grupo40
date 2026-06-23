import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TropelsPage } from './pages/TropelsPage'
import { FeedPage } from './pages/FeedPage'
import { SectorsPage } from './pages/SectorsPage'
import { SectorStoryPage } from './pages/SectorStoryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tropels" element={<TropelsPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/sectors" element={<SectorsPage />} />
      </Route>
      {/* La historia ocupa pantalla completa: fuera del Layout pero protegida */}
      <Route
        path="/sectors/:id/story"
        element={
          <ProtectedRoute>
            <SectorStoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
