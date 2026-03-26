// pages/ProfilePage.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <div className="bg-castle" />
      <Navbar />
      <main className="profile-main">
        <h1 className="profile-title">Mon Profil</h1>

        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <p className="profile-section-label">Vos informations</p>

          <div className="profile-info">
            <div className="profile-row">
              <span className="profile-key">nom:</span>
              <span className="profile-val">{user?.name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-key">email:</span>
              <span className="profile-val">{user?.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-key">Id du joueur:</span>
              <span className="profile-val">{user?.id}</span>
            </div>
          </div>

          <button className="btn btn-gold btn-lg profile-logout" onClick={handleLogout}>
            Se Deconnecter
          </button>
        </div>
      </main>
    </div>
  )
}
