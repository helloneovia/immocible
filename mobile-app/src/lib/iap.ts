/**
 * Achats intégrés App Store / Google Play (abonnement agence et déblocage de contacts).
 *
 * Chaque achat est envoyé à /api/iap/purchase, qui le vérifie auprès d'Apple ou de Google
 * avant d'en appliquer l'effet ; la transaction n'est terminée (finishTransaction) qu'après
 * cette validation, pour qu'un achat interrompu (réseau, fermeture de l'app) soit renvoyé
 * par le store au lancement suivant.
 */
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  deepLinkToSubscriptions,
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  isUserCancelledError,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
} from 'expo-iap'
import { t } from '@/i18n'
import { api, ApiError } from '@/lib/api'
import type { PublicSettings } from '@/lib/settings'

export type Plan = 'monthly' | 'yearly'
type Kind = 'subscription' | 'unlock'

export interface StoreProduct {
  id: string
  displayPrice: string
  /** Android : jeton de l'offre (forfait de base) à acheter. */
  offerToken?: string
}

export interface PurchaseResult {
  success: boolean
  subscriptionEndDate?: string
}

/** Erreur « l'utilisateur a fermé la feuille de paiement » : à ignorer silencieusement. */
export class PurchaseCancelled extends Error {}

const IOS = Platform.OS === 'ios'
const PENDING_UNLOCKS_KEY = 'immocible_iap_pending_unlocks'

/** Paiements via les stores activés par l'admin (et plateforme mobile). */
export function storeBillingEnabled(settings: PublicSettings) {
  return settings.iap_enabled && (Platform.OS === 'ios' || Platform.OS === 'android')
}

export function subscriptionProductId(settings: PublicSettings, plan: Plan) {
  if (IOS) return plan === 'yearly' ? settings.iap_apple_product_yearly : settings.iap_apple_product_monthly
  return plan === 'yearly' ? settings.iap_google_product_yearly : settings.iap_google_product_monthly
}

function basePlanId(settings: PublicSettings, plan: Plan) {
  return plan === 'yearly' ? settings.iap_google_base_plan_yearly : settings.iap_google_base_plan_monthly
}

/** Produit consommable du palier couvrant ce budget (même règle que lib/iap côté serveur). */
export function unlockProductId(settings: PublicSettings, prixMax?: number | null): string | null {
  const tiers = [...(settings.iap_unlock_tiers || [])].sort((a, b) => (a.maxBudget ?? Infinity) - (b.maxBudget ?? Infinity))
  const budget = prixMax || 0
  const tier = tiers.find((tier) => tier.maxBudget === null || tier.maxBudget === undefined || budget <= tier.maxBudget)
  return (tier ? (IOS ? tier.apple : tier.google) : null) || null
}

function isSubscriptionProduct(settings: PublicSettings, productId: string) {
  return productId === subscriptionProductId(settings, 'monthly') || productId === subscriptionProductId(settings, 'yearly')
}

// --- Connexion et écouteurs -------------------------------------------------

let settingsRef: PublicSettings | null = null
let connection: Promise<void> | null = null
const waiters = new Map<string, { resolve: (r: PurchaseResult) => void; reject: (e: unknown) => void }>()
const inFlight = new Set<string>()

/** Ouvre la connexion au store (une fois) et traite les achats restés en attente. */
export function connectStore(settings: PublicSettings) {
  settingsRef = settings
  if (!connection) {
    connection = initConnection()
      .then(() => {
        purchaseUpdatedListener((purchase) => {
          handlePurchase(purchase)
        })
        purchaseErrorListener((error) => rejectWaiter(error))
        return processPendingPurchases()
      })
      .catch((err) => {
        connection = null
        throw err
      })
  }
  return connection
}

function rejectWaiter(error: { message?: string; productId?: string | null }) {
  const cancelled = isUserCancelledError(error)
  const reason = cancelled ? new PurchaseCancelled() : new Error(error.message || t('agency.store.purchaseFailed'))
  const ids = error.productId ? [error.productId] : [...waiters.keys()]
  for (const id of ids) {
    waiters.get(id)?.reject(reason)
    waiters.delete(id)
  }
}

async function pendingUnlocks(): Promise<Record<string, string>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(PENDING_UNLOCKS_KEY)) || '{}')
  } catch {
    return {}
  }
}

async function setPendingUnlock(productId: string, buyerId: string | null) {
  const map = await pendingUnlocks()
  if (buyerId) map[productId] = buyerId
  else delete map[productId]
  await AsyncStorage.setItem(PENDING_UNLOCKS_KEY, JSON.stringify(map)).catch(() => {})
}

function purchaseKey(purchase: Purchase) {
  return (IOS ? purchase.transactionId || purchase.id : purchase.purchaseToken) || purchase.id
}

/** Envoie l'achat au serveur, puis le termine auprès du store. */
async function submitPurchase(purchase: Purchase, kind: Kind, buyerId?: string): Promise<PurchaseResult> {
  let result: PurchaseResult
  try {
    result = await api<PurchaseResult>('/api/iap/purchase', {
      method: 'POST',
      body: {
        platform: Platform.OS,
        kind,
        productId: purchase.productId,
        transactionId: IOS ? purchase.transactionId || purchase.id : undefined,
        purchaseToken: IOS ? undefined : purchase.purchaseToken,
        buyerId,
      },
    })
  } catch (err) {
    // Achat définitivement refusé (autre compte, mauvais produit) : on le termine pour
    // qu'il ne soit pas renvoyé à chaque lancement. Les autres erreurs seront retentées.
    const code = err instanceof ApiError ? err.data?.code : null
    if (code === 'wrongAccount' || code === 'wrongProduct' || code === 'alreadyUsed') {
      await finishTransaction({ purchase, isConsumable: kind === 'unlock' }).catch(() => {})
    }
    throw err
  }
  await finishTransaction({ purchase, isConsumable: kind === 'unlock' })
  return result
}

async function handlePurchase(purchase: Purchase) {
  const settings = settingsRef
  const key = purchaseKey(purchase)
  if (!settings || purchase.purchaseState === 'pending' || inFlight.has(key)) return
  inFlight.add(key)
  const waiter = waiters.get(purchase.productId)
  try {
    let result: PurchaseResult
    if (isSubscriptionProduct(settings, purchase.productId)) {
      result = await submitPurchase(purchase, 'subscription')
    } else {
      const buyerId = (await pendingUnlocks())[purchase.productId]
      if (!buyerId) return // déblocage sans acquéreur connu : laissé en attente
      result = await submitPurchase(purchase, 'unlock', buyerId)
      await setPendingUnlock(purchase.productId, null)
    }
    waiter?.resolve(result)
  } catch (err) {
    waiter?.reject(err)
  } finally {
    if (waiter) waiters.delete(purchase.productId)
    inFlight.delete(key)
  }
}

/** Au lancement : déblocages non consommés et abonnements Android non confirmés. */
async function processPendingPurchases() {
  const settings = settingsRef
  if (!settings) return
  const purchases = await getAvailablePurchases().catch(() => [] as Purchase[])
  for (const purchase of purchases) {
    const subscription = isSubscriptionProduct(settings, purchase.productId)
    const unacknowledged = !IOS && (purchase as { isAcknowledgedAndroid?: boolean | null }).isAcknowledgedAndroid === false
    if (!subscription || unacknowledged) await handlePurchase(purchase)
  }
}

// --- Produits ---------------------------------------------------------------

/** Prix affichés par le store (dans la devise de l'utilisateur). */
export async function loadProducts(settings: PublicSettings, ids: string[], type: 'subs' | 'in-app') {
  await connectStore(settings)
  const skus = [...new Set(ids.filter(Boolean))]
  const products: Record<string, StoreProduct> = {}
  if (!skus.length) return products
  const list = ((await fetchProducts({ skus, type })) || []) as any[]
  for (const product of list) {
    const offers: any[] = product.subscriptionOffers || []
    products[product.id] = { id: product.id, displayPrice: product.displayPrice, offerToken: offers[0]?.offerTokenAndroid ?? undefined }
  }
  return products
}

/** Produits d'abonnement indexés par formule, avec le prix de l'offre de base choisie (Android). */
export async function loadSubscriptionProducts(settings: PublicSettings) {
  await connectStore(settings)
  const plans: Plan[] = ['monthly', 'yearly']
  const result: Partial<Record<Plan, StoreProduct>> = {}
  const skus = [...new Set(plans.map((plan) => subscriptionProductId(settings, plan)).filter(Boolean))]
  if (!skus.length) return result
  const list = ((await fetchProducts({ skus, type: 'subs' })) || []) as any[]
  for (const plan of plans) {
    const product = list.find((p) => p.id === subscriptionProductId(settings, plan))
    if (!product) continue
    if (IOS) {
      result[plan] = { id: product.id, displayPrice: product.displayPrice }
      continue
    }
    // Android : l'offre de base configurée, sinon la première (sans offre promotionnelle d'abord).
    const offers: any[] = product.subscriptionOffers || []
    const wanted = basePlanId(settings, plan)
    const offer =
      (wanted ? offers.find((o) => o.basePlanIdAndroid === wanted && !o.id) ?? offers.find((o) => o.basePlanIdAndroid === wanted) : null) ??
      offers.find((o) => !o.id) ??
      offers[0]
    if (!offer) continue
    result[plan] = { id: product.id, displayPrice: offer.displayPrice || product.displayPrice, offerToken: offer.offerTokenAndroid ?? undefined }
  }
  return result
}

// --- Achats -----------------------------------------------------------------

function waitFor(productId: string) {
  return new Promise<PurchaseResult>((resolve, reject) => {
    waiters.get(productId)?.reject(new PurchaseCancelled())
    waiters.set(productId, { resolve, reject })
  })
}

/** Achète (ou change de) formule d'abonnement. Résout une fois l'achat validé par le serveur. */
export async function buySubscription(settings: PublicSettings, userId: string, product: StoreProduct) {
  await connectStore(settings)
  const done = waitFor(product.id)
  // Android : passer d'une formule à l'autre remplace l'abonnement en cours au lieu d'en ajouter un.
  let current: Purchase | undefined
  if (!IOS) {
    const owned = await getAvailablePurchases().catch(() => [] as Purchase[])
    current = owned.find((p) => isSubscriptionProduct(settings, p.productId) && p.purchaseToken)
  }
  try {
    await requestPurchase({
      type: 'subs',
      request: {
        apple: { sku: product.id, appAccountToken: userId },
        google: {
          skus: [product.id],
          obfuscatedAccountId: userId,
          subscriptionOffers: product.offerToken ? [{ sku: product.id, offerToken: product.offerToken }] : undefined,
          ...(current
            ? {
                purchaseToken: current.purchaseToken,
                subscriptionProductReplacementParams: { oldProductId: current.productId, replacementMode: 'with-time-proration' as const },
              }
            : {}),
        },
      },
    })
  } catch (err) {
    waiters.delete(product.id)
    throw isUserCancelledError(err) ? new PurchaseCancelled() : err
  }
  return done
}

/** Achète le déblocage d'un acquéreur (produit consommable du palier). */
export async function buyUnlock(settings: PublicSettings, userId: string, productId: string, buyerId: string) {
  await connectStore(settings)
  await setPendingUnlock(productId, buyerId)
  const done = waitFor(productId)
  try {
    await requestPurchase({
      type: 'in-app',
      request: {
        apple: { sku: productId, appAccountToken: userId },
        google: { skus: [productId], obfuscatedAccountId: userId },
      },
    })
  } catch (err) {
    waiters.delete(productId)
    await setPendingUnlock(productId, null)
    throw isUserCancelledError(err) ? new PurchaseCancelled() : err
  }
  return done
}

/** Restaure l'abonnement acheté sur ce compte store (nouvel appareil, réinstallation). */
export async function restoreSubscription(settings: PublicSettings) {
  await connectStore(settings)
  const purchases = await getAvailablePurchases()
  let restored: PurchaseResult | null = null
  let failure: unknown = null
  for (const purchase of purchases) {
    if (!isSubscriptionProduct(settings, purchase.productId)) continue
    try {
      const result = await submitPurchase(purchase, 'subscription')
      if (!restored || (result.subscriptionEndDate || '') > (restored.subscriptionEndDate || '')) restored = result
    } catch (err) {
      failure = err
    }
  }
  if (!restored && failure) throw failure
  return restored
}

/** Ouvre la gestion des abonnements du store (résiliation, changement de moyen de paiement). */
export function manageSubscriptions(settings: PublicSettings, plan?: Plan | null) {
  return deepLinkToSubscriptions({
    skuAndroid: plan ? subscriptionProductId(settings, plan) : undefined,
    packageNameAndroid: Constants.expoConfig?.android?.package ?? 'com.immocible.app',
  })
}
