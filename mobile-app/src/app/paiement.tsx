import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { WebView } from 'react-native-webview'
import { CheckCircle2, Lock, ShieldCheck, X, XCircle } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { useAuth } from '@/contexts/AuthContext'
import { api, API_URL, errorMessage } from '@/lib/api'
import { useStatusBar } from '@/lib/hooks'
import { colors, fonts, radius, spacing } from '@/theme'

type Phase = 'loading' | 'ready' | 'verifying' | 'success' | 'error'

function checkoutHtml(publishableKey: string, clientSecret: string) {
  const pk = JSON.stringify(publishableKey).replace(/</g, '\\u003c')
  const cs = JSON.stringify(clientSecret).replace(/</g, '\\u003c')
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>html,body{margin:0;background:#fff}#checkout{min-height:100vh;padding:8px 0}</style>
</head><body><div id="checkout"></div>
<script src="https://js.stripe.com/v3/"></script>
<script>
(async function(){
  function post(m){ window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
  try {
    if (!window.Stripe) throw new Error('Le module de paiement est indisponible.');
    var stripe = Stripe(${pk});
    var checkout = await stripe.initEmbeddedCheckout({ clientSecret: ${cs} });
    checkout.mount('#checkout');
    post({ type: 'mounted' });
  } catch (e) {
    post({ type: 'error', message: String((e && e.message) || e) });
  }
})();
</script></body></html>`
}

/**
 * Paiement Stripe Embedded Checkout (abonnement agence ou déblocage de contact).
 * À la fin du paiement, Stripe redirige vers le return_url du site contenant
 * `session_id` : on intercepte cette navigation et on valide côté API avec la
 * session de l'application.
 */
export default function PaiementScreen() {
  const { clientSecret, kind, buyerId } = useLocalSearchParams<{ clientSecret?: string; kind?: string; buyerId?: string }>()
  const { refresh } = useAuth()
  const insets = useSafeAreaInsets()
  const [publishableKey, setPublishableKey] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [message, setMessage] = useState<string | null>(null)
  useStatusBar('dark')

  const isUnlock = kind === 'unlock'

  useEffect(() => {
    if (!clientSecret) {
      setPhase('error')
      setMessage('Informations de session manquantes. Veuillez réessayer.')
      return
    }
    api<{ stripe_public_key?: string }>('/api/public/settings')
      .then((data) => {
        if (!data?.stripe_public_key) throw new Error('Paiement non configuré.')
        setPublishableKey(data.stripe_public_key)
      })
      .catch((err) => {
        setPhase('error')
        setMessage(errorMessage(err, "Impossible d'initialiser le paiement."))
      })
  }, [clientSecret])

  const html = useMemo(
    () => (publishableKey && clientSecret ? checkoutHtml(publishableKey, clientSecret) : null),
    [publishableKey, clientSecret],
  )

  const complete = async (sessionId: string) => {
    setPhase('verifying')
    try {
      if (isUnlock) {
        const result = await api<{ success?: boolean; error?: string }>('/api/payment/verify', {
          method: 'POST',
          body: { sessionId },
        })
        if (!result?.success) throw new Error(result?.error || 'Le paiement n’a pas été confirmé.')
        setMessage('Paiement validé avec succès ! Les coordonnées de cet acquéreur sont débloquées.')
      } else {
        await api(`/api/payment/success?session_id=${encodeURIComponent(sessionId)}`)
        await refresh()
        setMessage('Votre abonnement agence est maintenant actif.')
      }
      setPhase('success')
    } catch (err) {
      setPhase('error')
      setMessage(errorMessage(err, 'Impossible de vérifier le paiement. Veuillez contacter le support.'))
    }
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'))
  const topPadding = Platform.OS === 'ios' ? 14 : insets.top + 8

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={10} onPress={close} style={styles.close}>
          <X size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>{isUnlock ? 'Déblocage du contact' : 'Abonnement agence'}</Text>
        <View style={styles.secure}>
          <ShieldCheck size={14} color={colors.emerald700} />
          <Text style={styles.secureText}>Sécurisé</Text>
        </View>
      </View>

      {phase === 'success' || phase === 'error' ? (
        <View style={[styles.result, { paddingBottom: insets.bottom + 24 }]}>
          {phase === 'success' ? (
            <CheckCircle2 size={64} color={colors.emerald500} />
          ) : (
            <XCircle size={64} color={colors.red500} />
          )}
          <Text variant="title" center>
            {phase === 'success' ? 'Paiement réussi !' : 'Erreur de paiement'}
          </Text>
          <Text variant="body" center color={colors.slate500}>
            {message}
          </Text>
          <Button title={phase === 'success' ? 'Continuer' : 'Retour'} onPress={close} style={{ alignSelf: 'stretch' }} />
        </View>
      ) : (
        <View style={styles.flex}>
          {html ? (
            <WebView
              source={{ html, baseUrl: API_URL }}
              originWhitelist={['*']}
              style={styles.flex}
              setSupportMultipleWindows={false}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data)
                  if (data.type === 'mounted') setPhase('ready')
                  if (data.type === 'error') {
                    setPhase('error')
                    setMessage(data.message || "Impossible d'initialiser le paiement.")
                  }
                } catch {
                  // ignoré
                }
              }}
              onShouldStartLoadWithRequest={(request) => {
                const match = request.url.match(/[?&]session_id=([^&#]+)/)
                if (match && request.url.startsWith(API_URL)) {
                  complete(decodeURIComponent(match[1]))
                  return false
                }
                return true
              }}
            />
          ) : null}
          {phase === 'loading' || phase === 'verifying' ? (
            <View style={[StyleSheet.absoluteFill, styles.overlay]}>
              <View style={styles.lockCircle}>
                <Lock size={28} color={colors.white} />
              </View>
              <ActivityIndicator color={colors.emerald500} />
              <Text variant="subheading" center>
                {phase === 'verifying' ? 'Vérification du paiement...' : 'Préparation de votre paiement sécurisé...'}
              </Text>
              <Text variant="caption">Sécurisé par Stripe</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.slate200,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  secure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.emerald50,
  },
  secureText: { fontFamily: fonts.medium, fontSize: 12, color: colors.emerald700 },
  overlay: { alignItems: 'center', justifyContent: 'center', gap: 14, backgroundColor: colors.white, padding: 32 },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.emerald500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: spacing.xxl },
})
