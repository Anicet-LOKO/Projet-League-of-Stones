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

const POLL_INTERVAL = 4000 // 4 secondes

export default function GamePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [matchData, setMatchData] = useState(null)
  const [allCards, setAllCards] = useState([])
  const [phase, setPhase] = useState('loading') // loading | deck | game | finished
  const [selectedDeck, setSelectedDeck] = useState([])
  const [selectedAttacker, setSelectedAttacker] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const pollRef = useRef(null)

  // Détermine quel joueur on est (player1 ou player2)
  const myKey = matchData
    ? (matchData.player1?.id === user?.id ? 'player1' : 'player2')
    : null
  const enemyKey = myKey === 'player1' ? 'player2' : 'player1'
  const me = matchData?.[myKey]
  const enemy = matchData?.[enemyKey]
  const isMyTurn = me?.turn === true

  const showMessage = (msg, duration = 3000) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }

  // Récupérer l'état du match
  const fetchMatch = useCallback(async () => {
    try {
      const res = await getMatch()
      const data = res.data.data
      setMatchData(data)

      if (data.status === 'Deck is pending') {
        setPhase('deck')
        clearInterval(pollRef.current)
      } else if (data.player1?.turn === false && data.player2?.turn === false) {
        setPhase('finished')
        clearInterval(pollRef.current)
      } else {
        setPhase('game')
      }
    } catch (err) {
      setError('Impossible de récupérer l\'état du match')
    }
  }, [])

  // Charger les cartes disponibles pour le deck
  const fetchCards = async () => {
    try {
      const res = await getAllCards()
      setAllCards(res.data.data || [])
    } catch (err) {
      setError('Impossible de récupérer les cartes')
    }
  }

  useEffect(() => {
    fetchMatch()
    fetchCards()
  }, [fetchMatch])

  // Polling pendant le jeu
  useEffect(() => {
    if (phase === 'game') {
      pollRef.current = setInterval(fetchMatch, POLL_INTERVAL)
    }
    return () => clearInterval(pollRef.current)
  }, [phase, fetchMatch])

  // ─── ACTIONS DECK ────────────────────────────────────────────────────────────

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
      setError(err.response?.data?.message || 'Erreur lors de la validation du deck')
    }
  }

  // ─── ACTIONS JEU ─────────────────────────────────────────────────────────────

  const handlePickCard = async () => {
    try {
      await pickCard()
      fetchMatch()
      showMessage('Carte piochée !')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de piocher')
    }
  }

  const handlePlayCard = async (cardKey) => {
    try {
      await playCard(cardKey)
      fetchMatch()
      showMessage(`${cardKey} posé sur le plateau !`)
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de jouer cette carte')
    }
  }

  const handleAttack = async (enemyCardKey) => {
    if (!selectedAttacker) return
    try {
      if (enemyCardKey === 'player') {
        await attackPlayer(selectedAttacker)
        showMessage(`Attaque directe sur l'adversaire !`)
      } else {
        await attack(selectedAttacker, enemyCardKey)
        showMessage(`${selectedAttacker} attaque ${enemyCardKey} !`)
      }
      setSelectedAttacker(null)
      fetchMatch()
    } catch (err) {
      setError(err.response?.data?.message || 'Attaque impossible')
    }
  }

  const handleEndTurn = async () => {
    try {
      await endTurn()
      setSelectedAttacker(null)
      fetchMatch()
      showMessage('Tour terminé. À l\'adversaire de jouer…')
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de terminer le tour')
    }
  }

  const handleFinishMatch = async () => {
    try {
      await finishMatch()
    } catch (_) {
      // L'adversaire a peut-être déjà appelé finishMatch, c'est normal
    } finally {
      navigate('/')
    }
  }

  // ─── RENDER PHASES ───────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-screen">Chargement du match…</div>
      </div>
    )
  }

  if (phase === 'deck') {
    return (
      <div className="page">
        <Navbar />
        <main className="deck-main">
          <h1 className="deck-title">Constituez votre deck</h1>
          <p className="deck-subtitle">Sélectionnez jusqu'à 20 champions ({selectedDeck.length}/20 sélectionnés)</p>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="deck-selected-keys">
            {selectedDeck.map((c) => (
              <span key={c.key} className="deck-tag">{c.key}</span>
            ))}
          </div>

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

          <div className="deck-actions">
            <button
              className="btn btn-primary"
              onClick={handleInitDeck}
              disabled={selectedDeck.length === 0}
            >
              ✓ Valider mon deck ({selectedDeck.length} cartes)
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (phase === 'finished') {
    const winner = matchData?.status || 'Partie terminée'
    return (
      <div className="page">
        <Navbar />
        <div className="finished-screen">
          <h1 className="finished-title">Partie terminée</h1>
          <p className="finished-status">{winner}</p>
          <button className="btn btn-primary" onClick={handleFinishMatch}>
            Retour au menu
          </button>
        </div>
      </div>
    )
  }

  // ─── PHASE JEU ───────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <Navbar />
      <main className="game-main">
        {error && <div className="alert alert-error" onClick={() => setError('')}>{error} ✕</div>}
        {message && <div className="game-message">{message}</div>}

        {/* Info adversaire */}
        <div className="player-zone enemy-zone">
          <div className="player-info">
            <span className="player-label">Adversaire</span>
            <span className="player-hp">❤ {enemy?.hp ?? '?'} PV</span>
            <span className="player-counts">
              Main: {typeof enemy?.hand === 'number' ? enemy.hand : (enemy?.hand?.length ?? 0)} •
              Deck: {typeof enemy?.deck === 'number' ? enemy.deck : (enemy?.deck?.length ?? 0)}
            </span>
          </div>

          {/* Board adverse */}
          <div className="board-label">Plateau adverse</div>
          <div className="board">
            {/* Attaque directe si board vide */}
            {(enemy?.board?.length ?? 0) === 0 && isMyTurn && selectedAttacker && (
              <button className="btn btn-danger direct-attack-btn" onClick={() => handleAttack('player')}>
                ⚔ Attaque directe !
              </button>
            )}
            {(enemy?.board || []).map((card) => (
              <div
                key={card.key}
                className={`board-card enemy ${selectedAttacker ? 'targetable' : ''}`}
                onClick={() => selectedAttacker && handleAttack(card.key)}
              >
                <CardComponent card={card} />
              </div>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="turn-indicator">
          {isMyTurn ? '⚔ C\'est votre tour !' : '⏳ Tour de l\'adversaire…'}
        </div>

        {/* Info joueur */}
        <div className="player-zone my-zone">
          <div className="board-label">Mon plateau</div>
          <div className="board">
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

          {/* Main */}
          <div className="hand-section">
            <div className="player-info">
              <span className="player-label">Vous — {user?.name}</span>
              <span className="player-hp">❤ {me?.hp} PV</span>
            </div>

            {isMyTurn && (
              <div className="turn-actions">
                <button
                  className="btn btn-sm"
                  onClick={handlePickCard}
                  disabled={me?.cardPicked}
                >
                  {me?.cardPicked ? 'Déjà pioché' : '🃏 Piocher'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={handleEndTurn}>
                  Fin du tour →
                </button>
              </div>
            )}

            <div className="hand-label">Ma main ({(me?.hand || []).length} cartes)</div>
            <div className="hand">
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
