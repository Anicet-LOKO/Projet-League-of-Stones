// components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import logo from '../assets/logo.jpeg'

export default function Navbar() {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [connectedSince, setConnectedSince] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) return
    const start = Date.now()
    const interval = setInterval(() => {
      setConnectedSince(Math.floor((Date.now() - start) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const formatTime = (secs) => {
    if (secs < 60) return `${secs} seconde${secs > 1 ? 's' : ''}`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''}`
    return `${Math.floor(mins / 60)} heure${Math.floor(mins/60) > 1 ? 's' : ''}`
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="League of Stones" style={{height: '55px', objectFit: 'contain'}} />
      </Link>

      {isLoggedIn && (
        <div className="navbar-right">
          <div className="navbar-links">
            <Link to="/">Accueil</Link>
            <Link to="/matchmaking">Matchmaking</Link>
            <Link to="/cards">Mes cartes</Link>
            <Link to="/profile">Mon Profil</Link>
          </div>
          <div className="navbar-profile" onClick={() => navigate('/profile')}>
            <div className="navbar-profile-top">
              <div className="navbar-profile-icon">👤</div>
              <div className="navbar-dot" />
            </div>
            <span className="navbar-since">Connecté depuis: {formatTime(connectedSince)}</span>
          </div>
        </div>
      )}
    </nav>
  )
}