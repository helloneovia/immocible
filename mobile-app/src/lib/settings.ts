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

/** Fusionne la réponse serveur en ignorant les champs vides (même logique que le web : `x || défaut`). */
export function mergeSettings(data: Partial<PublicSettings> | null | undefined): PublicSettings {
  const merged: any = { ...DEFAULT_SETTINGS }
  if (!data) return merged
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') merged[key] = value
  }
  return merged
}
