import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

// Favicon de marque : maison + épingle sur fond marine (lisible sur onglets
// clairs comme sombres). Couleurs solides car le moteur de rendu OG ne gère
// pas les dégradés SVG.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B1F38',
          borderRadius: 96,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="360"
          height="360"
          viewBox="0 0 64 64"
          fill="none"
        >
          <path
            d="M26 55 L13 55 L13 25 L32 7 L43 17.4 L43 11 L48 11 L48 22.1 L51 25 L51 55 L38 55"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="32" cy="33" r="12.5" stroke="#FFFFFF" strokeWidth="3.4" fill="none" />
          <path
            d="M32 31 L32 47"
            stroke="#E0A93B"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="28.5" r="5.8" fill="#E0A93B" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
