
import { prisma } from '@/lib/prisma'

const DEFAULT_SETTINGS = [
    {
        key: 'price_monthly',
        value: '29',
        type: 'number',
        label: 'Prix Mensuel (Agence)',
        description: 'Le prix de l\'abonnement mensuel en euros.'
    },
    {
        key: 'price_yearly',
        value: '290',
        type: 'number',
        label: 'Prix Annuel (Agence)',
        description: 'Le prix de l\'abonnement annuel en euros.'
    },
    {
        key: 'price_unlock_profile_percentage',
        value: '1',
        type: 'number',
        label: 'Prix Déblocage Profil (%)',
        description: 'Pourcentage du budget max de l\'acquéreur (ex: 1 = 1%, 0.5 = 0.5%).'
    },
    {
        key: 'feature_list_monthly',
        value: JSON.stringify([
            "Accès aux profils acquéreurs",
            "Système de matching intelligent",
            "Tableau de bord complet",
            "Support prioritaire 7j/7"
        ]),
        type: 'json',
        label: 'Caractéristiques (Mensuel)',
        description: 'Liste des fonctionnalités affichées pour le plan mensuel.'
    },
    {
        key: 'feature_list_yearly',
        value: JSON.stringify([
            "Accès aux profils acquéreurs",
            "Système de matching intelligent",
            "Tableau de bord complet",
            "Support prioritaire 7j/7",
            "2 mois offerts",
            "Badge Agence Certifiée"
        ]),
        type: 'json',
        label: 'Caractéristiques (Annuel)',
        description: 'Liste des fonctionnalités affichées pour le plan annuel.'
    },
    {
        key: 'stripe_secret_key',
        value: process.env.STRIPE_SECRET_KEY || '',
        type: 'string',
        label: 'Clé Secrète Stripe',
        description: 'Clé secrète Stripe utilisée pour les paiements (STRIPE_SECRET_KEY).'
    },
    {
        key: 'stripe_public_key',
        value: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        type: 'string',
        label: 'Clé Publique Stripe',
        description: 'Clé publique Stripe utilisée par le frontend.'
    },
    // Marketing Texts
    {
        key: 'text_hero_title',
        value: "Le moteur de recherche inverse de l'immobilier",
        type: 'string',
        label: 'Titre Principal (Hero)',
        description: 'Titre principal affiché en haut de la page d\'accueil.'
    },
    {
        key: 'text_signup_agency_title',
        value: "Créer mon compte agence",
        type: 'string',
        label: 'Titre Inscription Agence',
        description: 'Titre de la page d\'inscription agence.'
    },
    {
        key: 'text_signup_agency_subtitle',
        value: "Accédez à des acquéreurs vérifiés et sérieux. Choisissez votre plan.",
        type: 'string',
        label: 'Sous-titre Inscription Agence',
        description: 'Sous-titre de la page d\'inscription agence.'
    },
    {
        key: 'text_trust_payment',
        value: "Paiement sécurisé",
        type: 'string',
        label: 'Texte Paiement Sécurisé',
        description: 'Texte affiché à côté de l\'icône de sécurité.'
    },
    {
        key: 'text_trust_trial',
        value: "Essai gratuit 14 jours",
        type: 'string',
        label: 'Texte Essai Gratuit',
        description: 'Texte affiché à côté de l\'icône d\'essai gratuit.'
    }
]

export async function POST(req: Request) {
    try {
        for (const setting of DEFAULT_SETTINGS) {
            await prisma.systemSetting.upsert({
                where: { key: setting.key },
                update: {},
                create: setting
            })
        }
        return Response.json({ success: true, message: 'Settings initialized' })
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 })
    }
}
