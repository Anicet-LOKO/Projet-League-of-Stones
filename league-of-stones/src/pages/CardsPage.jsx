// pages/CardsPage.jsx
import { useState, useEffect } from 'react'
import { getAllCards } from '../services/api'
import Navbar from '../components/Navbar'
import CardComponent from '../components/CardComponent'
import './CardsPage.css'

export default function CardsPage() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllCards()
      .then(res => setCards(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="bg-castle" />
      <Navbar />
      <main className="cards-main">
        <h1 className="cards-title">Mes cartes</h1>
        <p className="cards-sub">Voici toutes vos cartes</p>

        {loading ? (
          <div className="cards-loading">Chargement des cartes…</div>
        ) : (
          <div className="cards-grid">
            {cards.map(card => (
              <CardComponent key={card.key} card={card} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
