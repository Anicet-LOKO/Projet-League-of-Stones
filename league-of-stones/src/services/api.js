// services/api.js
import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['WWW-Authenticate'] = token
  }
  return config
})

// ─── UTILISATEURS ────────────────────────────────────────────
export const register = (email, name, password) =>
  api.put('/user', { email, name, password })

export const login = (email, password) =>
  api.post('/login', { email, password })

export const logout = () =>
  api.post('/logout')

export const unsubscribe = (email, password) =>
  api.post('/users/unsubscribe', { email, password })

// ─── MATCHMAKING ─────────────────────────────────────────────
export const participate = () =>
  api.get('/matchmaking/participate')

export const getAllPlayers = () =>
  api.get('/matchmaking/getAll')

export const sendRequest = (matchmakingId) =>
  api.get(`/matchmaking/request?matchmakingId=${matchmakingId}`)

export const acceptRequest = (matchmakingId) =>
  api.get(`/matchmaking/acceptRequest?matchmakingId=${matchmakingId}`)

// ─── MATCH ───────────────────────────────────────────────────
export const getMatch = () =>
  api.get('/match/getMatch')

export const initDeck = (deck) =>
  api.get(`/match/initDeck?deck=${encodeURIComponent(JSON.stringify(deck))}`)

export const pickCard = () =>
  api.get('/match/pickCard')

export const playCard = (cardKey) =>
  api.get(`/match/playCard?card=${encodeURIComponent(cardKey)}`)

export const attack = (cardKey, enemyCardKey) =>
  api.get(`/match/attack?card=${encodeURIComponent(cardKey)}&ennemyCard=${encodeURIComponent(enemyCardKey)}`)

export const attackPlayer = (cardKey) =>
  api.get(`/match/attackPlayer?card=${encodeURIComponent(cardKey)}`)

export const endTurn = () =>
  api.get('/match/endTurn')

export const finishMatch = () =>
  api.get('/match/finishMatch')

// ─── CARTES ──────────────────────────────────────────────────
export const getAllCards = () =>
  api.get('/cards')

export default api