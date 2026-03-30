// pages/GamePage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getMatch, getAllCards, initDeck,
  pickCard, playCard, attack, attackPlayer, endTurn, finishMatch
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import CardComponent from '../components/CardComponent'
import './GamePage.css'

const POLL_INTERVAL = 4000

export default function GamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matchData, setMatchData] = useState(null)
  const [allCards, setAllCards] = useState([])
  const [phase, setPhase] = useState('loading')
  const [selectedDeck, setSelectedDeck] = useState([])
  const [selectedAttacker, setSelectedAttacker] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const pollRef = useRef(null)

  const myKey = matchData
    ? (String(matchData.player1?.id) === String(user?.id) ? 'player1' : 'player2')
    : null
  const enemyKey = myKey === 'player1' ? 'player2' : 'player1'
  const me = matchData?.[myKey]
  const enemy = matchData?.[enemyKey]
  const isMyTurn = me?.turn === true

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  const fetchMatch = useCallback(async () => {
    try {
      const res = await getMatch()
      // Le backend renvoie directement sans wrapper { data: ... }
      const data = res.data?.data || res.data
      setMatchData(data)

      const status = data?.status || ''
      if (status.toLowerCase().includes('deck') && status.toLowerCase().includes('pending')) {
        setPhase('deck')
        clearInterval(pollRef.current)
      } else if (data?.player1?.turn === false && data?.player2?.turn === false) {
        setPhase('finished')
        clearInterval(pollRef.current)
      } else {
        setPhase('game')
      }
    } catch (err) {
      setError('Impossible de récupérer l\'état du match')
    }
  }, [])

  const fetchCards = useCallback(async () => {
    try {
      const res = await getAllCards()
      const cards = res.data?.data || res.data || []
      setAllCards(Array.isArray(cards) ? cards : [])
    } catch (err) {
      setError('Impossible de récupérer les cartes')
    }
  }, [])

  useEffect(() => {
    fetchMatch()
    fetchCards()
  }, [fetchMatch, fetchCards])

  useEffect(() => {
    if (phase === 'game') {
      pollRef.current = setInterval(fetchMatch, POLL_INTERVAL)
    }
    return () => clearInterval(pollRef.current)
  }, [phase, fetchMatch])

  const toggleCardInDeck = (card) => {
    if (selectedDeck.find((c) => c.key === card.key)) {
      setSelectedDeck(selectedDeck.filter((c) => c.key !== card.key))
    } else if (selectedDeck.length < 20) {
      setSelectedDeck([...selectedDeck, { key: card.key }])
    } else {
      showMessage('Deck complet (20 cartes maximum)')
    }
  }

  const handleInitDeck = async () => {
    if (selectedDeck.length === 0) {
      showMessage('Sélectionnez au moins une carte')
      return
    }
    try {
      await initDeck(selectedDeck)
      showMessage('Deck validé ! En attente de l\'adversaire…')
      fetchMatch()
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Erreur deck'
      setError(msg)
    }
  }

  const handlePickCard = async () => {
    try {
      await pickCard()
      fetchMatch()
      showMessage('Carte piochée !')
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Impossible de piocher'
      setError(msg)
    }
  }

  const handlePlayCard = async (cardKey) => {
    try {
      await playCard(cardKey)
      fetchMatch()
      showMessage(`${cardKey} posé sur le plateau !`)
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Impossible de jouer'
      setError(msg)
    }
  }

  const handleAttack = async (enemyCardKey) => {
    if (!selectedAttacker) return
    try {
      if (enemyCardKey === 'player') {
        await attackPlayer(selectedAttacker)
        showMessage('Attaque directe sur l\'adversaire !')
      } else {
        await attack(selectedAttacker, enemyCardKey)
        showMessage(`${selectedAttacker} attaque ${enemyCardKey} !`)
      }
      setSelectedAttacker(null)
      fetchMatch()
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Attaque impossible'
      setError(msg)
    }
  }

  const handleEndTurn = async () => {
    try {
      await endTurn()
      setSelectedAttacker(null)
      fetchMatch()
      showMessage('Tour terminé. À l\'adversaire de jouer…')
    } catch (err) {
      const msg = typeof err.response?.data === 'string' ? err.response.data : 'Impossible de terminer'
      setError(msg)
    }
  }

  const handleFinishMatch = async () => {
    try { await finishMatch() } catch (_) {}
    finally { navigate('/') }
  }

  if (phase === 'loading') {
    return (
      <div className="page">
        <div className="bg-castle" />
        <Navbar />
        <div className="loading-screen">Chargement du match…</div>
      </div>
    )
  }

  if (phase === 'deck') {
    return (
      <div className="page">
        <div className="bg-castle" />
        <Navbar />
        <main className="deck-main">
          <h1 className="deck-title">Sélection du deck</h1>
          <p className="deck-subtitle">Choisissez jusqu'à 20 champions ({selectedDeck.length}/20)</p>
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <div className="deck-layout">
            <div className="deck-grid-wrap">
              <div className="deck-cards-grid">
                {allCards.map((card) => (
                  <div
                    key={card.key}
                    className={`deck-card-item ${selectedDeck.find((c) => c.key === card.key) ? 'selected' : ''}`}
                    onClick={() => toggleCardInDeck(card)}
                  >
                    <CardComponent card={card} small />
                  </div>
                ))}
              </div>
            </div>
            <div className="deck-sidebar">
              <h3>Votre deck ({selectedDeck.length}/20)</h3>
              <ul className="deck-sidebar-list">
                {selectedDeck.map((c) => <li key={c.key}>{c.key}</li>)}
              </ul>
              <button
                className="btn btn-gold deck-validate"
                onClick={handleInitDeck}
                disabled={selectedDeck.length === 0}
              >
                ✓ Valider
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (phase === 'finished') {
    return (
      <div className="page">
        <div className="bg-castle" />
        <Navbar />
        <div className="finished-screen">
          <h1 className="finished-title">Partie terminée</h1>
          <p className="finished-status">{matchData?.status || ''}</p>
          <button className="btn btn-gold" onClick={handleFinishMatch}>
            Retour au menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="bg-castle" />
      <Navbar />
      <main className="game-main">
        <h1 className="game-title">Match</h1>
        {error && <div className="alert alert-error" onClick={() => setError('')}>{error} ✕</div>}
        {message && <div className="game-message">{message}</div>}

        <div className="player-zone enemy-zone">
          <div className="game-zone-header">
            <span className="gz-label">Adversaire</span>
            <span className="gz-hp">❤ {enemy?.hp ?? '?'} PV</span>
            <span className="gz-stones">
              Main: {typeof enemy?.hand === 'number' ? enemy.hand : (enemy?.hand?.length ?? 0)} •
              Deck: {typeof enemy?.deck === 'number' ? enemy.deck : (enemy?.deck?.length ?? 0)}
            </span>
          </div>
          <div className="board-label">Plateau adverse</div>
          <div className="game-board">
            {(enemy?.board?.length ?? 0) === 0 && isMyTurn && selectedAttacker && (
              <button className="btn btn-gold direct-attack-btn" onClick={() => handleAttack('player')}>
                ⚔ Attaque directe !
              </button>
            )}
            {(enemy?.board || []).map((card) => (
              <div
                key={card.key}
                className={`board-card ${selectedAttacker ? 'targetable' : ''}`}
                onClick={() => selectedAttacker && handleAttack(card.key)}
              >
                <CardComponent card={card} />
              </div>
            ))}
          </div>
        </div>

        <div className="game-turn-bar">
          {isMyTurn ? '⚔ C\'est votre tour !' : '⏳ Tour de l\'adversaire…'}
        </div>

        <div className="player-zone my-zone">
          <div className="game-zone-header">
            <span className="gz-label">Vous — {user?.name}</span>
            <span className="gz-hp">❤ {me?.hp ?? '?'} PV</span>
          </div>
          <div className="board-label">Mon plateau</div>
          <div className="game-board">
            {(me?.board || []).map((card) => {
              const canAttack = isMyTurn && !card.attack && !card.newCard
              const isSelected = selectedAttacker === card.key
              return (
                <div
                  key={card.key}
                  className={`board-card mine ${canAttack ? 'attackable' : ''} ${isSelected ? 'selected-attacker' : ''}`}
                  onClick={() => canAttack && setSelectedAttacker(isSelected ? null : card.key)}
                >
                  <CardComponent card={card} />
                  {isSelected && <div className="card-selected-label">Sélectionné</div>}
                </div>
              )
            })}
          </div>

          <div className="hand-section">
            {isMyTurn && (
              <div className="game-actions">
                <button className="btn btn-gold btn-sm" onClick={handlePickCard} disabled={me?.cardPicked}>
                  {me?.cardPicked ? 'Déjà pioché' : '🃏 Piocher'}
                </button>
                <button className="btn btn-outline btn-sm" onClick={handleEndTurn}>
                  Fin du tour →
                </button>
              </div>
            )}
            <div className="hand-label">Ma main ({(me?.hand || []).length} cartes)</div>
            <div className="game-hand">
              {(me?.hand || []).map((card) => (
                <div
                  key={card.key}
                  className={`hand-card ${isMyTurn && (me?.board?.length ?? 0) < 5 ? 'playable' : ''}`}
                  onClick={() => isMyTurn && (me?.board?.length ?? 0) < 5 && handlePlayCard(card.key)}
                >
                  <CardComponent card={card} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}