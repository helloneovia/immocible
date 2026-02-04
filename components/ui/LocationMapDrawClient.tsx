'use client'

import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'
import type { DrawnAreaGeoJSON } from './LocationMapDraw'

// Static imports for Leaflet and Geoman
// This component must be loaded via dynamic import with ssr: false in the parent (LocationMapDraw.tsx)
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

// Fix for default marker icons in Leaflet with Webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface LocationMapDrawClientProps {
  value: DrawnAreaGeoJSON | null
  onChange: (value: DrawnAreaGeoJSON | null) => void
  height?: string
}

const MapDrawCore = forwardRef<
  { clear: () => void },
  {
    onChange: (v: DrawnAreaGeoJSON | null) => void
    initialGeoJSON: DrawnAreaGeoJSON | null
  }
>(function MapDrawCore({ onChange, initialGeoJSON }, ref) {
  const map = useMap()
  const layerGroupRef = useRef<L.LayerGroup | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!map) return

    // Ensure L is attached to window for Geoman if needed (some plugins rely on it)
    if (typeof window !== 'undefined' && !(window as any).L) {
      (window as any).L = L
    }

    console.log('MapDrawCore: Checking Geoman support', {
      pmAvailable: !!map.pm,
      globalPm: !!(L as any).PM
    })

    if (!map.pm) {
      console.error('MapDrawCore: map.pm is missing even after static import')
      // Fallback: if global L.PM exists, the map might need manual init if not patched automatically
      return
    }

    if (initialized.current) return
    initialized.current = true

    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map)
    }

    // Initialize Geoman controls
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
      } catch (_) { }
      return null
    }

    const getLayersSafe = () => {
      if (!map?.pm) return []
      const result = map.pm.getGeomanLayers()
      if (Array.isArray(result)) return result
      if (result && typeof result === 'object') return Object.values(result)
      return []
    }

    const syncToParent = () => {
      const layers = getLayersSafe()
      if (layers.length === 0) {
        onChange(null)
        return
      }
      // Get the last drawn layer
      const last = layers[layers.length - 1]
      const geo = getGeoJSON(last)
      if (geo) onChange(geo)
    }

    map.on('pm:create', (e: any) => {
      console.log('MapDrawCore: pm:create', e)
      // Enforce single polygon: remove others
      const layers = getLayersSafe()

      console.log('MapDrawCore: allLayers', layers)

      layers.forEach((layer: any) => {
        if (layer !== e.layer && layer._leaflet_id !== e.layer._leaflet_id) {
          try { layer.remove() } catch (_) { }
        }
      })

      e.layer.addTo(layerGroupRef.current!)
      syncToParent()
    })

    map.on('pm:edit', () => syncToParent())
    map.on('pm:remove', () => syncToParent())

    // Hydrate initial value
    if (initialGeoJSON?.coordinates?.[0]?.length >= 3) {
      try {
        const latlngs = initialGeoJSON.coordinates[0].map((c) => [c[1], c[0]] as [number, number])
        const poly = L.polygon(latlngs, {
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(layerGroupRef.current)

        // No need for manual enable, Geoman detects layers on the map or we can register it
        // L.PM.reInitLayer(poly) might be needed if added after controls init?
        // Usually simply adding to map is enough for editMode to pick it up.
      } catch (err) {
        console.error('Error hydrating initial geojson', err)
      }
    }

    return () => {
      // Cleanup
      if (map.pm) {
        map.pm.disableGlobalEditMode()
        map.pm.disableDraw()
        try {
          map.pm.removeControls()
        } catch (_) { }
      }
      layerGroupRef.current?.clearLayers()
      initialized.current = false
    }
  }, [map, onChange, initialGeoJSON])

  const clear = useCallback(() => {
    if (!map?.pm) return
    const result = map.pm.getGeomanLayers()
    const allLayers = Array.isArray(result) ? result : (result ? Object.values(result) : [])

    allLayers.forEach((layer: any) => layer.remove())
    onChange(null)
  }, [map, onChange])

  useImperativeHandle(ref, () => ({ clear }), [clear])

  return null
})

const MAP_FALLBACK = (
  <div className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center p-6" style={{ minHeight: 280 }}>
    <p className="text-sm text-gray-500 text-center">
      La carte n&apos;est pas disponible ici. Utilisez la recherche de villes ci-dessus pour préciser vos zones.
    </p>
  </div>
)

function LocationMapDrawClientInner({ value, onChange, height = '400px' }: LocationMapDrawClientProps) {
  const clearRef = useRef<{ clear: () => void }>(null)
  // Check if MapContainer is available (it is, since we import statically)
  const canRenderMap = true

  if (!canRenderMap) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Dessinez une zone sur la carte (optionnel).
        </p>
        {MAP_FALLBACK}
      </div>
    )
  }

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
          <MapDrawCore ref={clearRef} onChange={onChange} initialGeoJSON={value} />
        </MapContainer>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute bottom-3 left-3 z-[1000] bg-white shadow"
          onClick={() => clearRef.current?.clear()}
        >
          <Eraser className="h-4 w-4 mr-1" />
          Effacer la zone
        </Button>
      </div>
    </div>
  )
}

export default function LocationMapDrawClient(props: LocationMapDrawClientProps) {
  return <LocationMapDrawClientInner {...props} />
}
