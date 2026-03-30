// components/CardComponent.jsx
export default function CardComponent({ card, small = false }) {
  if (!card) return null
  const atk = card.info?.attack ?? '?'
  const def = card.info?.defense ?? '?'
  const name = card.name || card.key || 'Champion'
  const key = card.key || card.name

  // Image officielle Riot Games
  const imgUrl = `https://ddragon.leagueoflegends.com/cdn/13.1.1/img/champion/${key}.png`

  return (
    <div className={`game-card ${small ? 'game-card--small' : ''}`}>
      <div className="card-name">{name}</div>
      <div className="card-image-placeholder">
        <img
          src={imgUrl}
          alt={name}
          style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>
      <div className="card-stats">
        <span className="card-atk">⚔ {atk}</span>
        <span className="card-def">🛡 {def}</span>
      </div>
    </div>
  )
}