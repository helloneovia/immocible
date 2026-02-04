'use client'

import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser2 } from 'lucide-react'

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

// Must be rendered inside MapContainer; receives useMap from parent (same react-leaflet instance)
const MapDrawCore = forwardRef<
  { clear: () => void },
  {
    useMapHook: () => any
    onChange: (v: DrawnAreaGeoJSON | null) => void
    initialGeoJSON: DrawnAreaGeoJSON | null
  }
>(function MapDrawCore({ useMapHook, onChange, initialGeoJSON }, ref) {
  const map = useMapHook()
  const layerGroupRef = useRef<any>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!map) return

    let L: any
    const setup = async () => {
      L = (await import('leaflet')).default
      await import('@geoman-io/leaflet-geoman-free')
      if (!map.pm) return
      if (initialized.current) return
      initialized.current = true

      if (!layerGroupRef.current && L) {
        layerGroupRef.current = L.layerGroup().addTo(map)
      }

      map.pm.addControls({
        position: 'topright',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawCircle: false,
        drawPolygon: true,
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
        rotateMode: false,
      })

      map.pm.setPathOptions({
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.25,
        weight: 2,
      })

      const getGeoJSON = (layer: any): DrawnAreaGeoJSON | null => {
        try {
          const geo = layer.toGeoJSON()
          if (geo.type === 'Polygon' && geo.coordinates?.[0]?.length >= 3) {
            return { type: 'Polygon', coordinates: geo.coordinates }
          }
        } catch (_) {}
        return null
      }

      const syncToParent = () => {
        const layers = map.pm.getGeomanLayers(true)
        if (layers.length === 0) {
          onChange(null)
          return
        }
        const last = layers[layers.length - 1]
        const geo = getGeoJSON(last)
        if (geo) onChange(geo)
      }

      map.on('pm:create', (e: any) => {
        e.layer.addTo(layerGroupRef.current)
        syncToParent()
      })
      map.on('pm:edit', () => syncToParent())
      map.on('pm:remove', () => syncToParent())

      if (initialGeoJSON?.coordinates?.[0]?.length >= 3) {
        try {
          const latlngs = initialGeoJSON.coordinates[0].map((c) => [c[1], c[0]] as [number, number])
          const poly = L.polygon(latlngs, {
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.25,
            weight: 2,
          }).addTo(layerGroupRef.current)
          if (poly.pm) poly.pm.enable({ drag: true, edit: true })
        } catch (_) {}
      }
    }
    setup()

    return () => {
      if (map.pm) {
        map.pm.disable()
        try {
          map.pm.removeControls()
        } catch (_) {}
      }
      layerGroupRef.current?.clearLayers?.()
      initialized.current = false
    }
  }, [map, onChange, initialGeoJSON])

  const clear = useCallback(() => {
    if (!map?.pm) return
    map.pm.getGeomanLayers(true).forEach((layer: any) => layer.remove())
    onChange(null)
  }, [map, onChange])

  useImperativeHandle(ref, () => ({ clear }), [clear])

  return null
})

function LocationMapDrawInner({ value, onChange, height = '400px' }: LocationMapDrawProps) {
  const clearRef = useRef<{ clear: () => void }>(null)
  const [Leaflet, setLeaflet] = React.useState<{
    MapContainer: any
    TileLayer: any
    useMap: () => any
  } | null>(null)

  useEffect(() => {
    (async () => {
      await import('leaflet')
      await import('@geoman-io/leaflet-geoman-free')
      const RL = await import('react-leaflet')
      setLeaflet({
        MapContainer: RL.MapContainer,
        TileLayer: RL.TileLayer,
        useMap: RL.useMap,
      })
    })()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    require('leaflet/dist/leaflet.css')
    require('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css')
  }, [])

  if (!Leaflet) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center"
        style={{ height }}
      >
        <span className="text-gray-500">Chargement de la carte…</span>
      </div>
    )
  }

  const { MapContainer, TileLayer, useMap } = Leaflet

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Dessinez une zone sur la carte (cliquez pour placer les points, fermez le polygone pour valider). Idéal pour des quartiers ou rues précis.
      </p>
      <div className="relative rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
        <MapContainer
          center={[46.603354, 1.888334]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapDrawCore
            ref={clearRef}
            useMapHook={useMap}
            onChange={onChange}
            initialGeoJSON={value}
          />
        </MapContainer>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute bottom-3 left-3 z-[1000] bg-white shadow"
          onClick={() => clearRef.current?.clear()}
        >
          <Eraser2 className="h-4 w-4 mr-1" />
          Effacer la zone
        </Button>
      </div>
    </div>
  )
}

// Next.js: render map only on client to avoid "window is not defined"
export function LocationMapDraw(props: LocationMapDrawProps) {
  const [mounted, setMounted] = React.useState(false)
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

  return <LocationMapDrawInner {...props} />
}
