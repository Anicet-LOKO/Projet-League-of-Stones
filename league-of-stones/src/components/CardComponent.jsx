// components/CardComponent.jsx
export default function CardComponent({ card, small = false }) {
  if (!card) return null
  const atk = card.info?.attack ?? '?'
  const def = card.info?.defense ?? '?'
  const name = card.name || card.key || 'Champion'
  return (
    <div className={`game-card ${small ? 'game-card--small' : ''}`}>
      <div className="card-name">{name}</div>
      <div className="card-image-placeholder">⚔</div>
      <div className="card-stats">
        <span className="card-atk">{atk}</span>
        <span className="card-def">{def}</span>
      </div>
    </div>
  )
}
