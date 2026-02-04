'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

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
        <span className="text-gray-500">Chargement de la carte…</span>
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
        <span className="text-gray-500">Chargement de la carte…</span>
      </div>
    )
  }

  return (
    <LocationMapDrawClient
      value={props.value}
      onChange={props.onChange}
      height={props.height}
    />
  )
}
