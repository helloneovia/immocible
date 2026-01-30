
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
}

export const DEFAULT_SETTINGS: AppSettings = {
    price_monthly: 29,
    price_yearly: 290,
    price_unlock_profile_percentage: 0.01, // 1% of budget
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
    stripe_public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
}

// Cached function to get settings
export const getAppSettings = unstable_cache(
    async (): Promise<AppSettings> => {
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
            })

            return config
        } catch (error) {
            console.error('Failed to fetch settings, using defaults', error)
            return DEFAULT_SETTINGS
        }
    },
    ['app-settings'],
    {
        revalidate: 60, // Cache for 60 seconds
        tags: ['settings']
    }
)

