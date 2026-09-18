
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

/**
 * Palier de prix d'un déblocage de contact vendu dans les applications : les stores
 * n'acceptent que des produits à prix fixe. Le palier s'applique aux acquéreurs dont le
 * budget maximum est inférieur ou égal à maxBudget (null = au-delà du dernier palier).
 */
export interface IapUnlockTier {
    maxBudget: number | null
    apple: string
    google: string
}

export interface AppSettings {
    price_monthly: number
    price_yearly: number
    price_unlock_profile_percentage: number
    price_unlock_profile_min_budget: number
    feature_list_monthly: string[]
    feature_list_yearly: string[]
    stripe_secret_key: string
    stripe_public_key: string
    // Paiements : Stripe sur le site, achats intégrés (App Store / Google Play) dans les applications
    payment_stripe_web_enabled: boolean
    iap_enabled: boolean
    iap_apple_product_monthly: string
    iap_apple_product_yearly: string
    iap_google_product_monthly: string
    iap_google_product_yearly: string
    iap_google_base_plan_monthly: string
    iap_google_base_plan_yearly: string
    iap_unlock_tiers: IapUnlockTier[]
    // Identifiants serveur (secrets, jamais exposés) pour vérifier les achats auprès des stores
    iap_apple_bundle_id: string
    iap_apple_issuer_id: string
    iap_apple_key_id: string
    iap_apple_private_key: string
    iap_google_package_name: string
    iap_google_service_account: string
    // Marketing Texts
    text_hero_title: string
    text_signup_agency_title: string
    text_signup_agency_subtitle: string
    text_trust_payment: string
    text_trust_trial: string
    // Buyer Signup Texts
    text_signup_buyer_title: string
    text_signup_buyer_subtitle: string
    text_trust_free: string
    text_trust_secure: string

    // Buyer Dashboard Search Popup Texts
    text_buyer_dashboard_popup_title: string
    text_buyer_dashboard_popup_description: string
    text_buyer_welcome_message: string

    // Home Page Texts
    text_home_hero_title_1: string
    text_home_hero_title_highlight: string
    text_home_hero_title_2: string
    text_home_hero_subtitle: string
    text_home_features_title: string
    text_home_features_subtitle: string
    text_home_cta_title: string
    text_home_cta_subtitle: string
    text_home_about_content: string
    text_footer_copyright: string
}

export const DEFAULT_SETTINGS: AppSettings = {
    price_monthly: 29,
    price_yearly: 290,
    price_unlock_profile_percentage: 1, // 1%
    price_unlock_profile_min_budget: 0, // 0 means apply to all
    feature_list_monthly: [
        "Accès aux profils acquéreurs",
        "Système de matching intelligent",
        "Tableau de bord complet",
        "Support prioritaire 7j/7"
    ],
    feature_list_yearly: [
        "Accès aux profils acquéreurs",
        "Système de matching intelligent",
        "Tableau de bord complet",
        "Support prioritaire 7j/7",
        "2 mois offerts",
        "Badge Agence Certifiée"
    ],
    stripe_secret_key: process.env.STRIPE_SECRET_KEY || '',
    stripe_public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    payment_stripe_web_enabled: true,
    iap_enabled: false,
    iap_apple_product_monthly: '',
    iap_apple_product_yearly: '',
    iap_google_product_monthly: '',
    iap_google_product_yearly: '',
    iap_google_base_plan_monthly: '',
    iap_google_base_plan_yearly: '',
    iap_unlock_tiers: [],
    iap_apple_bundle_id: 'com.immocible.app',
    iap_apple_issuer_id: '',
    iap_apple_key_id: '',
    iap_apple_private_key: '',
    iap_google_package_name: 'com.immocible.app',
    iap_google_service_account: '',

    // Marketing Texts Defaults
    text_hero_title: "Le moteur de recherche inverse de l'immobilier",
    text_signup_agency_title: "Créer mon compte agence",
    text_signup_agency_subtitle: "Accédez à des acquéreurs vérifiés et sérieux. Choisissez votre plan.",
    text_trust_payment: "Paiement sécurisé",
    text_trust_trial: "Essai gratuit 14 jours",
    // Buyer Signup Defaults
    text_signup_buyer_title: "Créer mon compte acquéreur",
    text_signup_buyer_subtitle: "Commencez votre recherche immobilière en quelques minutes",
    text_trust_free: "100% Gratuit",
    text_trust_secure: "Sécurisé",

    // Buyer Dashboard Search Popup Defaults
    text_buyer_dashboard_popup_title: "Recherche de biens en cours 🔍",
    text_buyer_welcome_message: "Bienvenue sur IMMOCIBLE !\n\nVotre compte est créé. Prochaine étape : décrivez votre projet (type de bien, budget, secteur). Il sera transmis à nos agences partenaires, qui vous écriront ici dès qu'un bien off-market correspond.\n\nVos coordonnées restent masquées : seules les agences qui débloquent votre dossier peuvent les voir.\n\nL'équipe IMMOCIBLE",
    text_buyer_dashboard_popup_description: "Votre profil a bien été enregistré. Nos agences partenaires analysent actuellement vos critères et nous vous contacterons dès qu'une opportunité off-market correspondante sera disponible.",

    // Home Page Defaults
    text_home_hero_title_1: "Trouvez votre",
    text_home_hero_title_highlight: "bien idéal",
    text_home_hero_title_2: "avant qu'il ne soit sur le marché",
    text_home_hero_subtitle: "IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières off-market. Fini les recherches interminables, découvrez les meilleurs biens correspondant à votre profil.",
    text_home_features_title: "Comment ça fonctionne ?",
    text_home_features_subtitle: "Une plateforme simple et efficace pour transformer votre recherche immobilière",
    text_home_cta_title: "Prêt à trouver votre bien idéal ?",
    text_home_cta_subtitle: "Rejoignez des centaines d'acquéreurs qui ont trouvé leur bien sur IMMOCIBLE",
    text_home_about_content: `IMMOCIBLE transforme la recherche immobilière grâce à la recherche inversée.

Les acquéreurs décrivent leur projet,
les biens et opportunités off-market viennent à eux.

IMMOCIBLE met en relation des acquéreurs qualifiés avec des agences disposant de biens ciblés ou à venir.

Pourquoi IMMOCIBLE ?
•  Accès à des opportunités avant leur mise sur le marché
•  Recherches précises, projets sérieux
•  Gain de temps pour les acquéreurs et les agences
•  Moins de concurrence, plus d’efficacité

IMMOCIBLE, quand les bons projets rencontrent les bonnes opportunités.`,
    text_footer_copyright: "© 2024 IMMOCIBLE. Tous droits réservés."
}

/** Valeur numérique saisie dans l'admin : accepte la virgule décimale (« 49,90 »). */
function parseSettingNumber(value: string) {
    return parseFloat(value.replace(/\s/g, '').replace(',', '.'))
}

// Direct DB fetch to avoid cache issues
export const getAppSettings = async (): Promise<AppSettings> => {
    try {
        const settings = await prisma.systemSetting.findMany()

        const config: any = { ...DEFAULT_SETTINGS }

        settings.forEach(s => {
            if (s.key === 'price_monthly') config.price_monthly = parseSettingNumber(s.value)
            if (s.key === 'price_yearly') config.price_yearly = parseSettingNumber(s.value)
            if (s.key === 'price_unlock_profile_percentage') config.price_unlock_profile_percentage = parseSettingNumber(s.value)
            if (s.key === 'price_unlock_profile_min_budget') config.price_unlock_profile_min_budget = parseSettingNumber(s.value)
            if (s.key === 'feature_list_monthly') {
                try { config.feature_list_monthly = JSON.parse(s.value) } catch { }
            }
            // Versions anglaises des listes (feature_list_*_en), saisies dans l'admin.
            if (s.key === 'feature_list_monthly_en' || s.key === 'feature_list_yearly_en') {
                try { config[s.key] = JSON.parse(s.value) } catch { }
            }
            if (s.key === 'feature_list_yearly') {
                try { config.feature_list_yearly = JSON.parse(s.value) } catch { }
            }
            if (s.key === 'stripe_secret_key') config.stripe_secret_key = s.value
            if (s.key === 'stripe_public_key') config.stripe_public_key = s.value
            // Paiements et achats intégrés
            if (s.key === 'payment_stripe_web_enabled' || s.key === 'iap_enabled') {
                config[s.key] = s.value.trim() !== 'false'
                if (s.key === 'iap_enabled') config[s.key] = s.value.trim() === 'true'
            }
            if (s.key === 'iap_unlock_tiers') {
                try {
                    const tiers = JSON.parse(s.value || '[]')
                    if (Array.isArray(tiers)) config.iap_unlock_tiers = tiers
                } catch { }
            } else if (s.key.startsWith('iap_') && s.key !== 'iap_enabled') {
                if (s.value.trim()) config[s.key] = s.value.trim()
            }

            // Generic text mapping
            if (s.key.startsWith('text_')) {
                config[s.key] = s.value
            }
        })

        return config
    } catch (error) {
        console.error('Failed to fetch settings, using defaults', error)
        return DEFAULT_SETTINGS
    }
}

/**
 * Textes administrables en anglais. Le français reste la référence (réglages text_* et
 * feature_list_*) ; une version anglaise saisie dans l'admin (clé suffixée « _en ») est
 * prioritaire, sinon ces textes par défaut sont utilisés.
 */
export const ENGLISH_DEFAULTS = {
    feature_list_monthly: [
        'Access to buyer profiles',
        'Smart matching system',
        'Complete dashboard',
        'Priority support 7 days a week',
    ],
    feature_list_yearly: [
        'Access to buyer profiles',
        'Smart matching system',
        'Complete dashboard',
        'Priority support 7 days a week',
        '2 months free',
        'Certified Agency badge',
    ],
    text_hero_title: 'The reverse search engine for real estate',
    text_signup_agency_title: 'Create my agency account',
    text_signup_agency_subtitle: 'Reach verified, serious buyers. Choose your plan.',
    text_trust_payment: 'Secure payment',
    text_trust_trial: '14-day free trial',
    text_signup_buyer_title: 'Create my buyer account',
    text_signup_buyer_subtitle: 'Start your property search in a few minutes',
    text_trust_free: '100% free',
    text_trust_secure: 'Secure',
    text_buyer_dashboard_popup_title: 'Property search in progress 🔍',
    text_buyer_dashboard_popup_description: "Your profile has been saved. Our partner agencies are now reviewing your criteria, and we'll get in touch as soon as a matching off-market opportunity becomes available.",
    text_buyer_welcome_message: "Welcome to IMMOCIBLE!\n\nYour account is ready. Next step: describe your project (property type, budget, area). It will be shared with our partner agencies, who will message you here as soon as a matching off-market property comes up.\n\nYour contact details stay hidden: only agencies that unlock your file can see them.\n\nThe IMMOCIBLE team",
    text_home_hero_title_1: 'Find your',
    text_home_hero_title_highlight: 'ideal property',
    text_home_hero_title_2: 'before it hits the market',
    text_home_hero_subtitle: 'IMMOCIBLE connects qualified buyers with off-market property opportunities. No more endless searching: discover the best properties matching your profile.',
    text_home_features_title: 'How does it work?',
    text_home_features_subtitle: 'A simple, effective platform to transform your property search',
    text_home_cta_title: 'Ready to find your ideal property?',
    text_home_cta_subtitle: 'Join hundreds of buyers who found their property on IMMOCIBLE',
    text_home_about_content: `IMMOCIBLE transforms property search with reverse search.

Buyers describe their project,
and off-market properties and opportunities come to them.

IMMOCIBLE connects qualified buyers with agencies holding targeted or upcoming properties.

Why IMMOCIBLE?
•  Access to opportunities before they reach the market
•  Precise searches, serious projects
•  Time saved for buyers and agencies
•  Less competition, more efficiency

IMMOCIBLE, where the right projects meet the right opportunities.`,
    text_footer_copyright: '© 2024 IMMOCIBLE. All rights reserved.',
} satisfies Partial<Record<keyof AppSettings, string | string[]>>

export type TranslatableSettingKey = keyof typeof ENGLISH_DEFAULTS
export const TRANSLATABLE_SETTING_KEYS = Object.keys(ENGLISH_DEFAULTS) as TranslatableSettingKey[]

/** Réglages dans la langue demandée (français : inchangés). */
export function localizeSettings<T extends Partial<AppSettings>>(settings: T, locale: 'fr' | 'en'): T {
    if (locale === 'fr') return settings
    const localized: any = { ...settings }
    for (const key of TRANSLATABLE_SETTING_KEYS) {
        const custom = (settings as any)[`${key}_en`]
        const hasCustom = Array.isArray(custom) ? custom.length > 0 : typeof custom === 'string' && custom.trim() !== ''
        localized[key] = hasCustom ? custom : ENGLISH_DEFAULTS[key]
    }
    return localized
}

/**
 * Réglages de paiement sans secret, exposés au site et aux applications
 * (/api/public/settings) : produits des stores, paliers de déblocage, interrupteurs.
 */
export function publicPaymentSettings(settings: AppSettings) {
    return {
        payment_stripe_web_enabled: settings.payment_stripe_web_enabled,
        iap_enabled: settings.iap_enabled,
        iap_apple_product_monthly: settings.iap_apple_product_monthly,
        iap_apple_product_yearly: settings.iap_apple_product_yearly,
        iap_google_product_monthly: settings.iap_google_product_monthly,
        iap_google_product_yearly: settings.iap_google_product_yearly,
        iap_google_base_plan_monthly: settings.iap_google_base_plan_monthly,
        iap_google_base_plan_yearly: settings.iap_google_base_plan_yearly,
        iap_unlock_tiers: settings.iap_unlock_tiers,
    }
}

/** Valeur renvoyée à l'admin à la place d'un secret configuré (jamais la vraie valeur). */
export const SECRET_PLACEHOLDER = '__secret_configured__'

/** Réglage secret : masqué dans l'admin et jamais journalisé. */
export function isSecretSetting(setting: { key: string; type?: string | null }) {
    return setting.type === 'secret' || setting.key === 'stripe_secret_key'
}
