// Sous-ensemble public de lib/settings.ts (web), renvoyé par /api/public/settings.
// Les valeurs par défaut sont identiques à celles du site.
export interface PublicSettings {
  price_monthly: number
  price_yearly: number
  feature_list_monthly: string[]
  feature_list_yearly: string[]
  stripe_public_key: string
  text_signup_agency_title: string
  text_signup_agency_subtitle: string
  text_trust_payment: string
  text_trust_trial: string
  text_signup_buyer_title: string
  text_signup_buyer_subtitle: string
  text_trust_free: string
  text_trust_secure: string
  text_buyer_dashboard_popup_title: string
  text_buyer_dashboard_popup_description: string
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

export const DEFAULT_SETTINGS: PublicSettings = {
  price_monthly: 29,
  price_yearly: 290,
  feature_list_monthly: [
    'Accès aux profils acquéreurs',
    'Système de matching intelligent',
    'Tableau de bord complet',
    'Support prioritaire 7j/7',
  ],
  feature_list_yearly: [
    'Accès aux profils acquéreurs',
    'Système de matching intelligent',
    'Tableau de bord complet',
    'Support prioritaire 7j/7',
    '2 mois offerts',
    'Badge Agence Certifiée',
  ],
  stripe_public_key: '',
  text_signup_agency_title: 'Créer mon compte agence',
  text_signup_agency_subtitle: 'Accédez à des acquéreurs vérifiés et sérieux. Choisissez votre plan.',
  text_trust_payment: 'Paiement sécurisé',
  text_trust_trial: 'Essai gratuit 14 jours',
  text_signup_buyer_title: 'Créer mon compte acquéreur',
  text_signup_buyer_subtitle: 'Commencez votre recherche immobilière en quelques minutes',
  text_trust_free: '100% Gratuit',
  text_trust_secure: 'Sécurisé',
  text_buyer_dashboard_popup_title: 'Recherche de biens en cours 🔍',
  text_buyer_dashboard_popup_description:
    "Votre profil a bien été enregistré. Nos agences partenaires analysent actuellement vos critères et nous vous contacterons dès qu'une opportunité off-market correspondante sera disponible.",
  text_home_hero_title_1: 'Trouvez votre',
  text_home_hero_title_highlight: 'bien idéal',
  text_home_hero_title_2: "avant qu'il ne soit sur le marché",
  text_home_hero_subtitle:
    'IMMOCIBLE connecte les acquéreurs qualifiés avec des opportunités immobilières off-market. Fini les recherches interminables, découvrez les meilleurs biens correspondant à votre profil.',
  text_home_features_title: 'Comment ça fonctionne ?',
  text_home_features_subtitle: 'Une plateforme simple et efficace pour transformer votre recherche immobilière',
  text_home_cta_title: 'Prêt à trouver votre bien idéal ?',
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
  text_footer_copyright: '© 2024 IMMOCIBLE. Tous droits réservés.',
}

/**
 * Valeurs par défaut en anglais (hors ligne). En ligne, /api/public/settings renvoie déjà
 * les textes dans la langue de l'app (en-tête X-Immocible-Lang). Copie de lib/settings.ts (web).
 */
export const DEFAULT_SETTINGS_EN: PublicSettings = {
  ...DEFAULT_SETTINGS,
  ...{
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
},
}

export function defaultSettings(locale: 'fr' | 'en'): PublicSettings {
  return locale === 'en' ? DEFAULT_SETTINGS_EN : DEFAULT_SETTINGS
}

/** Fusionne la réponse serveur en ignorant les champs vides (même logique que le web : `x || défaut`). */
export function mergeSettings(data: Partial<PublicSettings> | null | undefined, locale: 'fr' | 'en' = 'fr'): PublicSettings {
  const merged: any = { ...defaultSettings(locale) }
  if (!data) return merged
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') merged[key] = value
  }
  return merged
}
