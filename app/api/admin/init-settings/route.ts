
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/api-auth'
import { LEGAL_FIELDS } from '@/lib/legal'
import { DEFAULT_SETTINGS as APP_DEFAULTS, TRANSLATABLE_SETTING_KEYS } from '@/lib/settings'

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
        key: 'price_unlock_profile_min_budget',
        value: '0',
        type: 'number',
        label: 'Budget Minimum Acquéreur (€)',
        description: 'Budget minimum requis pour activer le prix de déblocage (sinon gratuit).'
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
        type: 'secret',
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
    {
        key: 'mailjet_api_key',
        value: process.env.MAILJET_API_KEY || '',
        type: 'string',
        label: 'Clé API Mailjet',
        description: 'Clé publique API Mailjet pour l\'envoi d\'emails.'
    },
    {
        key: 'mailjet_api_secret',
        value: process.env.MAILJET_SECRET_KEY || process.env.MAILJET_API_SECRET || '',
        type: 'string',
        label: 'Clé Secrète Mailjet',
        description: 'Clé secrète API Mailjet pour l\'envoi d\'emails.'
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
    // Buyer Dashboard Search Popup
    {
        key: 'text_buyer_dashboard_popup_title',
        value: "Recherche de biens en cours 🔍",
        type: 'string',
        label: 'Titre Popup Recherche (Acquéreur)',
        description: 'Titre de la popup affichée sur le tableau de bord acquéreur quand le profil est complété.'
    },
    {
        key: 'text_buyer_dashboard_popup_description',
        value: "Votre profil a bien été enregistré. Nos agences partenaires analysent actuellement vos critères et nous vous contacterons dès qu'une opportunité off-market correspondante sera disponible.",
        type: 'string',
        label: 'Description Popup Recherche (Acquéreur)',
        description: 'Texte descriptif de la popup affichée sur le tableau de bord acquéreur.'
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
        key: 'text_home_about_content',
        value: `IMMOCIBLE transforme la recherche immobilière grâce à la recherche inversée.

Les acquéreurs décrivent leur projet,
les biens et opportunités off-market viennent à eux.

IMMOCIBLE met en relation des acquéreurs qualifiés avec des agences disposant de biens ciblés ou à venir.

Pourquoi IMMOCIBLE ?
•  Accès à des opportunités avant leur mise sur le marché
•  Recherches précises, projets sérieux
•  Gain de temps pour les acquéreurs et les agences
•  Moins de concurrence, plus d’efficacité

IMMOCIBLE, quand les bons projets rencontrent les bonnes opportunités.`,
        type: 'string', // Use 'string' but render as textarea in admin because value is long
        label: 'Contenu "En Savoir Plus"',
        description: 'Texte affiché dans la modale "En savoir plus".'
    },
    {
        key: 'text_footer_copyright',
        value: "© 2024 IMMOCIBLE. Tous droits réservés.",
        type: 'string',
        label: 'Copyright Footer',
        description: 'Texte de copyright en bas de page.'
    },
    {
        key: 'text_buyer_welcome_message',
        value: APP_DEFAULTS.text_buyer_welcome_message,
        type: 'string',
        label: 'Message de bienvenue (Acquéreur)',
        description: "Message automatique envoyé par IMMOCIBLE dans la messagerie de chaque nouvel acquéreur, à l'inscription."
    },
    // Paiements : Stripe sur le site, achats intégrés (App Store / Google Play) dans les applications
    { key: 'payment_stripe_web_enabled', value: 'true', type: 'boolean', label: 'Paiement Stripe sur le site', description: "Désactivé : le site masque tous les paiements Stripe (abonnements, codes promo, déblocages payants) et invite à souscrire depuis l'application." },
    { key: 'iap_enabled', value: 'false', type: 'boolean', label: 'Achats intégrés dans les applications', description: "Activé : les applications iOS et Android vendent les abonnements et les déblocages via l'App Store et Google Play (obligatoire pour la publication sur les stores). Désactivé : les applications utilisent Stripe." },
    { key: 'iap_apple_product_monthly', value: '', type: 'string', label: 'Apple — produit abonnement mensuel', description: "Identifiant du produit (Product ID) de l'abonnement auto-renouvelable mensuel dans App Store Connect, ex. com.immocible.agence.mensuel." },
    { key: 'iap_apple_product_yearly', value: '', type: 'string', label: 'Apple — produit abonnement annuel', description: "Identifiant du produit de l'abonnement auto-renouvelable annuel dans App Store Connect (même groupe d'abonnements que le mensuel)." },
    { key: 'iap_google_product_monthly', value: '', type: 'string', label: 'Google Play — produit abonnement mensuel', description: "Identifiant de l'abonnement mensuel dans la Play Console (Monétiser › Abonnements)." },
    { key: 'iap_google_base_plan_monthly', value: '', type: 'string', label: 'Google Play — forfait de base mensuel', description: 'Identifiant du forfait de base (base plan) mensuel. Obligatoire si les deux formules utilisent le même produit Google ; sinon facultatif (vide : le premier forfait actif du produit).' },
    { key: 'iap_google_product_yearly', value: '', type: 'string', label: 'Google Play — produit abonnement annuel', description: "Identifiant de l'abonnement annuel dans la Play Console." },
    { key: 'iap_google_base_plan_yearly', value: '', type: 'string', label: 'Google Play — forfait de base annuel', description: 'Identifiant du forfait de base (base plan) annuel. Obligatoire si les deux formules utilisent le même produit Google ; sinon facultatif.' },
    { key: 'iap_unlock_tiers', value: '[]', type: 'json', label: 'Paliers de prix des déblocages (applications)', description: 'Les stores imposent des prix fixes : chaque palier associe un budget maximum de l\'acquéreur (maxBudget, en euros ; null pour le dernier palier) à un produit consommable Apple et Google. Ex. [{"maxBudget": 2000000, "apple": "com.immocible.deblocage.1", "google": "deblocage_1"}, {"maxBudget": null, "apple": "com.immocible.deblocage.2", "google": "deblocage_2"}]. Les déblocages gratuits (budget sous le seuil) restent gratuits.' },
    { key: 'iap_apple_bundle_id', value: 'com.immocible.app', type: 'string', label: 'Apple — Bundle ID', description: "Identifiant de l'application iOS, vérifié sur chaque achat." },
    { key: 'iap_apple_issuer_id', value: '', type: 'string', label: 'Apple — Issuer ID (API App Store Server)', description: 'App Store Connect › Utilisateurs et accès › Intégrations › Achats intégrés : identifiant émetteur.' },
    { key: 'iap_apple_key_id', value: '', type: 'string', label: 'Apple — Key ID (API App Store Server)', description: "Identifiant de la clé d'achats intégrés générée dans App Store Connect." },
    { key: 'iap_apple_private_key', value: '', type: 'secret', label: 'Apple — clé privée .p8', description: 'Contenu complet du fichier .p8 (-----BEGIN PRIVATE KEY----- …). Utilisé uniquement par le serveur pour vérifier les achats.' },
    { key: 'iap_google_package_name', value: 'com.immocible.app', type: 'string', label: 'Google Play — nom du package', description: "Identifiant de l'application Android, vérifié sur chaque achat." },
    { key: 'iap_google_service_account', value: '', type: 'secret', label: 'Google Play — compte de service (JSON)', description: "Contenu du fichier JSON d'un compte de service Google Cloud ayant accès à l'API Google Play Developer (Play Console › Utilisateurs et autorisations). Utilisé uniquement par le serveur." },
    // Versions anglaises des textes administrables (vides : textes anglais par défaut du site).
    ...TRANSLATABLE_SETTING_KEYS.map((key) => ({
        key: `${key}_en`,
        value: '',
        type: key.startsWith('feature_list') ? 'json' : 'string',
        label: `${key} (anglais)`,
        description: 'Version anglaise, affichée aux visiteurs qui ont choisi English. Laisser vide pour utiliser la traduction par défaut.'
    })),
    // Informations légales : affichées dans les mentions légales, les CGU et la politique de confidentialité (site et application).
    ...Object.entries(LEGAL_FIELDS).map(([key, field]) => ({
        key,
        value: field.value,
        type: 'string',
        label: field.label,
        description: `Remplace « ${field.placeholder} » dans les pages légales. Laisser vide pour l'afficher comme « à renseigner ».`
    }))
]

export async function POST(req: Request) {
    const { error } = await requireAdmin()
    if (error) return error

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

        revalidateTag('settings')

        return Response.json({ success: true, message: 'Settings initialized' })
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 })
    }
}
