// pages/MatchmakingPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { participate, getAllPlayers, sendRequest, acceptRequest } from '../services/api'
import Navbar from '../components/Navbar'
import './MatchmakingPage.css'

export default function MatchmakingPage() {
  const [status, setStatus] = useState('idle')
  const [players, setPlayers] = useState([])
  const [requests, setRequests] = useState([])
  const [matchmakingId, setMatchmakingId] = useState(null)
  const [sentTo, setSentTo] = useState(null)
  const [error, setError] = useState('')
  const pollRef = useRef(null)
  const navigate = useNavigate()

  const poll = useCallback(async () => {
    try {
      const res = await participate()
      const d = res.data?.data || res.data
      setRequests(d?.request || [])
    } catch {}
  }, [])

  useEffect(() => {
    if (status === 'waiting') {
      pollRef.current = setInterval(poll, 5000)
    }
    return () => clearInterval(pollRef.current)
  }, [status, poll])

  const handleParticipate = async () => {
    setError('')
    try {
      const res = await participate()
      const d = res.data?.data || res.data
      setMatchmakingId(d.matchmakingId)
      setRequests(d.request || [])
      setStatus('waiting')
      const listRes = await getAllPlayers()
      const list = listRes.data?.data || listRes.data || []
      setPlayers(Array.isArray(list) ? list : [])
    } catch (err) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Impossible de rejoindre'
      setError(msg)
    }
  }

  const handleRefresh = async () => {
    try {
      const res = await getAllPlayers()
      const list = res.data?.data || res.data || []
      setPlayers(Array.isArray(list) ? list : [])
    } catch {}
  }

  const handleSend = async (targetId, name) => {
    try {
      await sendRequest(targetId)
      setSentTo(name)
    } catch (err) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Erreur envoi'
      setError(msg)
    }
  }

  const handleAccept = async (senderMmId) => {
    try {
      await acceptRequest(senderMmId)
      clearInterval(pollRef.current)
      navigate('/game')
    } catch (err) {
      const msg = typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Erreur acceptation'
      setError(msg)
    }
  }

  return (
    <div className="page">
      <div className="bg-castle" />
      <Navbar />
      <main className="mm-main">
        <h1 className="mm-title">Matchmaking</h1>
        {error && <div className="alert alert-error">{error}</div>}

        {requests.length > 0 && (
          <div className="mm-requests-banner">
            {requests.map(r => (
              <div key={r.matchmakingId} className="mm-request-item">
                <span>⚔ <strong>{r.name}</strong> vous invite à jouer</span>
                <button className="btn btn-gold btn-sm" onClick={() => handleAccept(r.matchmakingId)}>
                  Accepter
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mm-actions">
          <button className="btn btn-outline" onClick={handleParticipate} disabled={status === 'waiting'}>
            {status === 'waiting' ? '✓ Dans la liste' : 'Rejoindre la liste des joueurs'}
          </button>
          <button className="btn btn-outline" onClick={handleRefresh} disabled={status === 'idle'}>
            Voir les joueurs disponibles
          </button>
        </div>

        {status === 'waiting' && (
          <div className="mm-players-section">
            <h2 className="mm-players-title">Joueurs disponibles</h2>
            {players.length === 0 ? (
              <p className="mm-empty">Aucun joueur disponible pour l'instant…</p>
            ) : (
              <ul className="mm-players-list">
                {players.map((p, i) => (
                  <li key={p.matchmakingId} className="mm-player-row">
                    <span>{p.name}</span>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleSend(p.matchmakingId, p.name)}
                      disabled={sentTo === p.name}
                    >
                      {sentTo === p.name ? 'Envoyé ✓' : 'Inviter'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mm-launch">
              <button className="btn btn-gold btn-lg" onClick={handleRefresh}>
                Actualiser
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
