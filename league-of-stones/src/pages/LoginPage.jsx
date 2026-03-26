// pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AuthPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      // Le backend renvoie parfois du texte brut, parfois du JSON
      const msg =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Identifiants incorrects'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="bg-castle" />
      <div className="auth-content">
        <h1 className="auth-title">Connexion</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-row">
            <label>Email:</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email universitaire @univ-tlse2.fr"
              required
            />
          </div>
          <div className="field-row">
            <label>Mot de passe:</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="auth-actions">
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </div>
        </form>
        <p className="auth-switch">
          Pas de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
