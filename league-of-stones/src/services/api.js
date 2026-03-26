// services/api.js
// Toutes les routes du backend League of Stones
import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
})

// Le backend autorise uniquement X-Requested-With dans CORS
// Le token WWW-Authenticate est envoyé en query param pour contourner
// En réalité on l'envoie quand même en header — le proxy Vite bypass le CORS
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
  api.post('/matchmaking/participate')

export const getAllPlayers = () =>
  api.get('/matchmaking/getAll')

export const sendRequest = (matchmakingId) =>
  api.post('/matchmaking/request', { matchmakingId })

export const acceptRequest = (matchmakingId) =>
  api.post('/matchmaking/acceptRequest', { matchmakingId })

// ─── MATCH ───────────────────────────────────────────────────
export const getMatch = () =>
  api.get('/match/getMatch')

export const initDeck = (deck) =>
  api.post(`/match/initDeck?deck=${encodeURIComponent(JSON.stringify(deck))}`)

export const pickCard = () =>
  api.post('/match/pickCard')

export const playCard = (cardKey) =>
  api.post(`/match/playCard?card=${encodeURIComponent(cardKey)}`)

export const attack = (cardKey, enemyCardKey) =>
  api.post(`/match/attack?card=${encodeURIComponent(cardKey)}&ennemyCard=${encodeURIComponent(enemyCardKey)}`)

export const attackPlayer = (cardKey) =>
  api.post(`/match/attackPlayer?card=${encodeURIComponent(cardKey)}`)

export const endTurn = () =>
  api.post('/match/endTurn')

export const finishMatch = () =>
  api.post('/match/finishMatch')

// ─── CARTES ──────────────────────────────────────────────────
export const getAllCards = () =>
  api.get('/cards')

export default api
