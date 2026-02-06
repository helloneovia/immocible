
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'

export interface AppSettings {
    price_monthly: number
    price_yearly: number
    price_unlock_profile_percentage: number
    feature_list_monthly: string[]
    feature_list_yearly: string[]
    stripe_secret_key: string
    stripe_public_key: string
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

// Direct DB fetch to avoid cache issues
export const getAppSettings = async (): Promise<AppSettings> => {
    try {
        const settings = await prisma.systemSetting.findMany()

        const config: any = { ...DEFAULT_SETTINGS }

        settings.forEach(s => {
            if (s.key === 'price_monthly') config.price_monthly = parseFloat(s.value)
            if (s.key === 'price_yearly') config.price_yearly = parseFloat(s.value)
            if (s.key === 'price_unlock_profile_percentage') config.price_unlock_profile_percentage = parseFloat(s.value)
            if (s.key === 'feature_list_monthly') {
                try { config.feature_list_monthly = JSON.parse(s.value) } catch { }
            }
            if (s.key === 'feature_list_yearly') {
                try { config.feature_list_yearly = JSON.parse(s.value) } catch { }
            }
            if (s.key === 'stripe_secret_key') config.stripe_secret_key = s.value
            if (s.key === 'stripe_public_key') config.stripe_public_key = s.value

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

