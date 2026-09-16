import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Keyboard, Modal, Pressable, StyleSheet, View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Check, Eraser, LocateFixed, Map as MapIcon, Maximize2, Undo2, X } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { getCurrentCoords } from '@/components/LocationButton'
import { searchCities } from '@/components/LocationAutocomplete'
import { API_URL } from '@/lib/api'
import type { DrawnArea } from '@/lib/types'
import { colors, fonts, radius, shadow } from '@/theme'

type MapMessage =
  | { type: 'ready' }
  | { type: 'draft'; count: number }
  | { type: 'change'; value: DrawnArea | null }
  | { type: 'error' }

/**
 * Carte Leaflet (tuiles OpenStreetMap) dans une WebView. Au tactile, on place les
 * sommets par touchers successifs puis on ferme le polygone — plus fiable que la
 * barre d'outils Geoman du web sur mobile. Le GeoJSON produit est identique.
 */
function buildHtml(initial: DrawnArea | null, readOnly: boolean) {
  const safeInitial = JSON.stringify(initial ?? null).replace(/</g, '\\u003c')
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<style>html,body,#map{margin:0;padding:0;height:100%;width:100%;background:#E2E8F0}</style>
</head><body><div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
(function(){
  var READ_ONLY = ${readOnly ? 'true' : 'false'};
  var INITIAL = ${safeInitial};
  function send(m){ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
  if (!window.L) { send({type:'error'}); return; }
  var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([46.603354, 1.888334], 6);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  map.attributionControl.setPrefix(false);
  var style = { color: '#0B1F38', weight: 2.5, fillColor: '#E0A93B', fillOpacity: 0.28 };
  var points = [], draft = null, markers = [], polygon = null;
  function renderDraft(){
    if (draft) { map.removeLayer(draft); draft = null; }
    markers.forEach(function(m){ map.removeLayer(m); }); markers = [];
    if (points.length) {
      draft = L.polyline(points, { color: '#0B1F38', weight: 2.5, dashArray: '6 6' }).addTo(map);
      points.forEach(function(p, i){
        markers.push(L.circleMarker(p, { radius: i === 0 ? 9 : 7, color: '#FFFFFF', weight: 2, fillColor: i === 0 ? '#E0A93B' : '#0B1F38', fillOpacity: 1 }).addTo(map));
      });
    }
    send({ type: 'draft', count: points.length });
  }
  function setPolygon(geo, fit){
    if (polygon) { map.removeLayer(polygon); polygon = null; }
    if (geo && geo.coordinates && geo.coordinates[0] && geo.coordinates[0].length >= 3) {
      polygon = L.polygon(geo.coordinates[0].map(function(c){ return [c[1], c[0]]; }), style).addTo(map);
      if (fit) map.fitBounds(polygon.getBounds(), { padding: [30, 30] });
    }
  }
  map.on('click', function(e){
    if (READ_ONLY || polygon) return;
    points.push([e.latlng.lat, e.latlng.lng]);
    renderDraft();
  });
  window.__cmd = function(cmd){
    if (cmd.type === 'undo') { points.pop(); renderDraft(); }
    if (cmd.type === 'finish' && points.length >= 3) {
      var ring = points.map(function(p){ return [p[1], p[0]]; });
      ring.push(ring[0]);
      var geo = { type: 'Polygon', coordinates: [ring] };
      points = []; renderDraft(); setPolygon(geo, false);
      send({ type: 'change', value: geo });
    }
    if (cmd.type === 'clear') { points = []; renderDraft(); setPolygon(null); send({ type: 'change', value: null }); }
    if (cmd.type === 'center') { map.setView([cmd.lat, cmd.lng], cmd.zoom || 13); }
  };
  setPolygon(INITIAL, true);
  send({ type: 'ready' });
})();
</script></body></html>`
}

function LeafletView({
  initial,
  readOnly,
  webRef,
  onMessage,
}: {
  initial: DrawnArea | null
  readOnly: boolean
  webRef?: React.RefObject<WebView | null>
  onMessage?: (message: MapMessage) => void
}) {
  // Le HTML n'est construit qu'au montage : les mises à jour passent par injectJavaScript.
  const html = useMemo(() => buildHtml(initial, readOnly), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <View style={styles.fallback}>
        <Text variant="caption" center>
          La carte n'est pas disponible. Utilisez la recherche de villes pour préciser vos zones.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.flex}>
      <WebView
        ref={webRef}
        // Une origine https est nécessaire pour que les tuiles OSM reçoivent un Referer valide.
        source={{ html, baseUrl: API_URL }}
        originWhitelist={['*']}
        style={styles.flex}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setSupportMultipleWindows={false}
        onMessage={(event: WebViewMessageEvent) => {
          try {
            const message = JSON.parse(event.nativeEvent.data) as MapMessage
            if (message.type === 'ready') setLoading(false)
            if (message.type === 'error') setFailed(true)
            onMessage?.(message)
          } catch {
            // message ignoré
          }
        }}
        onError={() => setFailed(true)}
      />
      {loading ? (
        <View style={[StyleSheet.absoluteFill, styles.loading]} pointerEvents="none">
          <ActivityIndicator color={colors.ink} />
        </View>
      ) : null}
    </View>
  )
}

/** Aperçu non interactif ; un toucher ouvre la carte en plein écran. */
export function MapZonePreview({
  value,
  height = 200,
  onPress,
}: {
  value: DrawnArea | null
  height?: number
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ouvrir la carte en plein écran"
      onPress={onPress}
      style={[styles.preview, { height }]}
    >
      <View style={styles.flex} pointerEvents="none">
        {/* key : remonte la carte quand la zone change pour recadrer l'aperçu */}
        <LeafletView key={JSON.stringify(value)} initial={value} readOnly />
      </View>
      <View style={styles.expand}>
        <Maximize2 size={16} color={colors.ink} />
      </View>
    </Pressable>
  )
}

/** Carte plein écran : dessin de zone (ou consultation si `readOnly`). */
export function MapZoneModal({
  visible,
  value,
  readOnly,
  centerOn,
  onClose,
  onChange,
}: {
  visible: boolean
  value: DrawnArea | null
  readOnly?: boolean
  /** Ville sur laquelle centrer la carte à l'ouverture si aucune zone n'existe. */
  centerOn?: string
  onClose: () => void
  onChange?: (value: DrawnArea | null) => void
}) {
  const insets = useSafeAreaInsets()
  const webRef = useRef<WebView>(null)
  const [draftCount, setDraftCount] = useState(0)
  const [area, setArea] = useState<DrawnArea | null>(value)

  const command = (cmd: Record<string, unknown>) => {
    webRef.current?.injectJavaScript(`window.__cmd && window.__cmd(${JSON.stringify(cmd)}); true;`)
  }

  const handleMessage = async (message: MapMessage) => {
    if (message.type === 'draft') setDraftCount(message.count)
    if (message.type === 'change') {
      setArea(message.value)
      onChange?.(message.value)
    }
    if (message.type === 'ready' && !value && centerOn) {
      try {
        const [city] = await searchCities(centerOn, 1)
        const coords = city?.geometry?.coordinates
        if (coords) command({ type: 'center', lat: coords[1], lng: coords[0], zoom: 12 })
      } catch {
        // centrage facultatif
      }
    }
  }

  const locate = async () => {
    const coords = await getCurrentCoords().catch(() => null)
    if (coords) command({ type: 'center', lat: coords.latitude, lng: coords.longitude, zoom: 14 })
  }

  const hint = readOnly
    ? 'Zone de recherche précise'
    : area
      ? 'Zone enregistrée. Effacez-la pour en dessiner une nouvelle.'
      : draftCount === 0
        ? 'Touchez la carte pour placer les points de votre zone.'
        : draftCount < 3
          ? `Encore ${3 - draftCount} point${3 - draftCount > 1 ? 's' : ''} minimum.`
          : 'Ajoutez des points ou validez la zone.'

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      onShow={() => {
        Keyboard.dismiss()
        setArea(value)
        setDraftCount(0)
      }}
    >
      <View style={styles.flex}>
        {visible ? <LeafletView initial={value} readOnly={!!readOnly} webRef={webRef} onMessage={handleMessage} /> : null}

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer la carte" onPress={onClose} style={styles.roundButton}>
            <X size={22} color={colors.ink} />
          </Pressable>
          <View style={styles.hint}>
            <MapIcon size={16} color={colors.amber600} />
            <Text style={styles.hintText}>{hint}</Text>
          </View>
          {!readOnly ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Centrer sur ma position" onPress={locate} style={styles.roundButton}>
              <LocateFixed size={20} color={colors.ink} />
            </Pressable>
          ) : null}
        </View>

        {!readOnly ? (
          <View style={[styles.toolbar, { paddingBottom: insets.bottom + 16 }]}>
            {area ? (
              <View style={styles.toolbarRow}>
                <Button title="Effacer la zone" icon={Eraser} variant="danger" onPress={() => command({ type: 'clear' })} style={styles.flex} />
                <Button title="Terminé" icon={Check} onPress={onClose} style={styles.flex} />
              </View>
            ) : (
              <View style={styles.toolbarRow}>
                <Button
                  title="Annuler"
                  icon={Undo2}
                  variant="outline"
                  disabled={draftCount === 0}
                  onPress={() => command({ type: 'undo' })}
                  style={styles.flex}
                />
                <Button
                  title="Valider la zone"
                  icon={Check}
                  variant="accent"
                  disabled={draftCount < 3}
                  onPress={() => command({ type: 'finish' })}
                  style={styles.flex}
                />
              </View>
            )}
          </View>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.slate100,
  },
  loading: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.slate100 },
  preview: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.slate100,
  },
  expand: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.raised,
  },
  hint: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    ...shadow.raised,
  },
  hintText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: colors.slate700 },
  toolbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.raised,
  },
  toolbarRow: { flexDirection: 'row', gap: 10 },
})
