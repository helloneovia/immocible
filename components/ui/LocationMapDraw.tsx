'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useI18n } from '@/lib/i18n/client'

// Texte de chargement de la carte, traduit.
function MapLoadingText() {
  const { t } = useI18n()
  return <span className="text-gray-500">{t('buyer.location.mapLoading')}</span>
}

// GeoJSON Polygon: coordinates[0] = exterior ring as [lng, lat][]
export type DrawnAreaGeoJSON = {
  type: 'Polygon'
  coordinates: [number, number][][]
}

interface LocationMapDrawProps {
  value: DrawnAreaGeoJSON | null
  onChange: (value: DrawnAreaGeoJSON | null) => void
  className?: string
  height?: string
  readOnly?: boolean
}

// Load map in a separate chunk with static react-leaflet imports so production bundle has valid components
const LocationMapDrawClient = dynamic(
  () => import('./LocationMapDrawClient').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        <MapLoadingText />
      </div>
    ),
  }
)

export function LocationMapDraw(props: LocationMapDrawProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
        style={{ height: props.height || '400px' }}
      >
        <MapLoadingText />
      </div>
    )
  }

  return (
    <LocationMapDrawClient
      value={props.value}
      onChange={props.onChange}
      height={props.height}
      readOnly={props.readOnly}
    />
  )
}
