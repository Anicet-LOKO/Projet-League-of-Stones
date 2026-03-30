// pages/HomePage.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import './HomePage.css'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="page">
      <div className="bg-castle" />
      <Navbar />
      <main className="home-main">
        <div className="home-hero">
          <h1 className="home-hero-title">Bienvenu dans le Game Et Stratégie</h1>
          <p className="home-hero-sub">Ceci est un jeu de cartes stratégique multijoueur.</p>
          <div className="home-hero-btns">
            {user ? (
              <button className="btn btn-gold btn-lg" onClick={() => navigate('/matchmaking')}>
                ⚔ Jouer maintenant
              </button>
            ) : (
              <>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')}>
                  Créer un compte
                </button>
                <button className="btn btn-gold btn-lg" onClick={() => navigate('/login')}>
                  Se Connecter
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}