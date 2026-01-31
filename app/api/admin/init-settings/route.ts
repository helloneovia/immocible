
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
    },
    // Buyer Signup
    {
        key: 'text_signup_buyer_title',
        value: "Créer mon compte acquéreur",
        type: 'string',
        label: 'Titre Inscription Acquéreur',
        description: 'Titre de la page d\'inscription acquéreur.'
    },
    {
        key: 'text_signup_buyer_subtitle',
        value: "Commencez votre recherche immobilière en quelques minutes",
        type: 'string',
        label: 'Sous-titre Inscription Acquéreur',
        description: 'Sous-titre de la page d\'inscription acquéreur.'
    },
    {
        key: 'text_trust_free',
        value: "100% Gratuit",
        type: 'string',
        label: 'Texte Gratuité',
        description: 'Texte indiquant la gratuité pour les acquéreurs.'
    },
    {
        key: 'text_trust_secure',
        value: "Sécurisé",
        type: 'string',
        label: 'Texte Sécurité (Générique)',
        description: 'Texte générique de sécurité.'
    },
    // Home Page
    {
        key: 'text_home_hero_title_1',
        value: "Trouvez votre",
        type: 'string',
        label: 'Titre Hero (Partie 1)',
        description: 'Première partie du titre principal sur la page d\'accueil.'
    },
    {
        key: 'text_home_hero_title_highlight',
        value: "bien idéal",
        type: 'string',
        label: 'Titre Hero (Surligné)',
        description: 'Partie du titre en couleur/dégradé.'
    },
    {
        key: 'text_home_hero_title_2',
        value: "avant qu'il ne soit sur le marché",
        type: 'string',
        label: 'Titre Hero (Partie 2)',
        description: 'Dernière partie du titre principal.'
    },
    {
        key: 'text_home_hero_subtitle',
        value: "IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières off-market. Fini les recherches interminables, découvrez les meilleurs biens correspondant à votre profil.",
        type: 'string',
        label: 'Sous-titre Hero',
        description: 'Paragraphe sous le titre principal.'
    },
    {
        key: 'text_home_features_title',
        value: "Comment ça fonctionne ?",
        type: 'string',
        label: 'Titre Fonctionnement',
        description: 'Titre de la section "Comment ça fonctionne".'
    },
    {
        key: 'text_home_features_subtitle',
        value: "Une plateforme simple et efficace pour transformer votre recherche immobilière",
        type: 'string',
        label: 'Sous-titre Fonctionnement',
        description: 'Sous-titre de la section "Comment ça fonctionne".'
    },
    {
        key: 'text_home_cta_title',
        value: "Prêt à trouver votre bien idéal ?",
        type: 'string',
        label: 'Titre Appel à l\'action',
        description: 'Titre de la section finale en bas de page.'
    },
    {
        key: 'text_home_cta_subtitle',
        value: "Rejoignez des centaines d'acquéreurs qui ont trouvé leur bien sur IMMOCIBLE",
        type: 'string',
        label: 'Sous-titre Appel à l\'action',
        description: 'Sous-titre de la section finale.'
    },
    {
        key: 'text_footer_copyright',
        value: "© 2024 IMMOCIBLE. Tous droits réservés.",
        type: 'string',
        label: 'Copyright Footer',
        description: 'Texte de copyright en bas de page.'
    }
]

export async function POST(req: Request) {
    try {
        for (const setting of DEFAULT_SETTINGS) {
            await prisma.systemSetting.upsert({
                where: { key: setting.key },
                update: {
                    label: setting.label,
                    description: setting.description,
                    type: setting.type
                },
                create: setting
            })
        }

        // Cleanup deprecated settings
        await prisma.systemSetting.deleteMany({
            where: {
                key: { in: ['price_unlock_profile'] }
            }
        })

        return Response.json({ success: true, message: 'Settings initialized' })
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 })
    }
}
