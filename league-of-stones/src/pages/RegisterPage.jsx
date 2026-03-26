// pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import './AuthPage.css'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.endsWith('@univ-tlse2.fr')) {
      setError("L'email doit être @univ-tlse2.fr")
      return
    }
    if (name.length < 3 || name.length > 28) {
      setError('Le nom doit contenir entre 3 et 28 caractères')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      await register(email, name, password)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="bg-castle" />
      <div className="auth-content">
        <h1 className="auth-title">Créer un compte</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form auth-form--register">
          <div className="field-row">
            <label>Nom:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field-row">
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email universitaire @univ-tlse2.fr" required />
          </div>
          <div className="field-row">
            <label>Mot de passe:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="field-row">
            <label>Confirmer Mot de passe:</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
          <div className="auth-actions">
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? 'Création...' : 'Valider'}
            </button>
          </div>
        </form>
        <p className="auth-switch">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
