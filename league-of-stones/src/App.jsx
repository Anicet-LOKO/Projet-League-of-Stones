// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import MatchmakingPage from './pages/MatchmakingPage'
import GamePage from './pages/GamePage'
import ProfilePage from './pages/ProfilePage'
import CardsPage from './pages/CardsPage'

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div className="loading-screen">Chargement…</div>
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/matchmaking" element={<PrivateRoute><MatchmakingPage /></PrivateRoute>} />
      <Route path="/game"    element={<PrivateRoute><GamePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/cards"   element={<PrivateRoute><CardsPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
