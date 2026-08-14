import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

// Favicon : une grosse cible (anneaux concentriques + centre doré) sur fond
// marine. Simple et lisible même à 16 px, et fidèle au nom « immo-CIBLE ».
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
          borderRadius: 112,
        }}
      >
        <svg width="470" height="470" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="26" stroke="#FFFFFF" strokeWidth="5" fill="none" />
          <circle cx="32" cy="32" r="15.5" stroke="#FFFFFF" strokeWidth="5" fill="none" />
          <circle cx="32" cy="32" r="6.5" fill="#E0A93B" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
