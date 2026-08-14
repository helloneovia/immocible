import { ImageResponse } from 'next/og'

export const alt = "IMMOCIBLE — Le moteur de recherche inversé de l'immobilier"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Image de partage (Open Graph / Twitter). Couleurs solides et pas de police
// personnalisée pour rester robuste au moteur de rendu.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B1F38',
          color: 'white',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
          <path
            d="M26 55 L13 55 L13 25 L32 7 L43 17.4 L43 11 L48 11 L48 22.1 L51 25 L51 55 L38 55"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="32" cy="33" r="12.5" stroke="#FFFFFF" strokeWidth="3.4" fill="none" />
          <path d="M32 31 L32 47" stroke="#E0A93B" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="32" cy="28.5" r="5.8" fill="#E0A93B" />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: 12,
          }}
        >
          IMMOCIBLE
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 30,
            color: '#CBD5E1',
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          Le moteur de recherche inversé de l&apos;immobilier off-market
        </div>
      </div>
    ),
    { ...size }
  )
}
