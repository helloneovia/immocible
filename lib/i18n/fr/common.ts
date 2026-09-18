/** Textes français — espace de noms « common ». Référence : l'anglais doit avoir exactement les mêmes clés. */
const common = {
  brand: {
    homeAria: 'IMMOCIBLE — accueil',
  },
  nav: {
    login: 'Connexion',
    getStarted: 'Commencer',
    messages: 'Messagerie',
    settings: 'Paramètres',
    logout: 'Déconnexion',
  },
  footer: {
    legalLinksAria: 'Liens légaux',
    legalNotice: 'Mentions légales',
    privacy: 'Confidentialité',
    terms: 'CGU / CGV',
    blog: 'Blog',
    copyright: "© {year} IMMOCIBLE. L'immobilier repensé. Tous droits réservés.",
  },
  notFound: {
    metaTitle: 'Page introuvable',
    title: "Cette page n'existe pas (ou plus)",
    text: 'Le lien que vous avez suivi est peut-être rompu, ou la page a été déplacée.',
    backHome: "Retour à l'accueil",
    seeBlog: 'Voir le blog',
  },
  error: {
    title: 'Une erreur est survenue',
    text: "Nous n'avons pas pu afficher cette page. Vous pouvez réessayer, ou revenir à l'accueil.",
    retry: 'Réessayer',
    backHome: "Retour à l'accueil",
  },
  cookies: {
    aria: 'Consentement aux cookies',
    textBefore: "Nous utilisons des cookies de mesure d'audience pour améliorer le service. Vous pouvez les accepter ou les refuser. En savoir plus dans notre",
    privacyLink: 'politique de confidentialité',
    refuse: 'Refuser',
    accept: 'Accepter',
  },
  payment: {
    preparing: 'Préparation de votre paiement sécurisé...',
    title: 'Paiement sécurisé',
    stripe: 'Sécurisé par Stripe',
    // Paiement Stripe désactivé sur le site : les achats se font dans les applications
    appOnlyTitle: 'Application mobile IMMOCIBLE',
    appOnlySubscription: "Les abonnements se souscrivent depuis l'application mobile IMMOCIBLE (iOS et Android).",
    appOnlyUnlock: "Le déblocage de ce contact se fait depuis l'application mobile IMMOCIBLE (iOS et Android).",
  },
  loading: 'Chargement...',
  pagination: {
    showing: 'Affichage de {from} à {to} sur {total} résultats',
    zero: '0 résultats',
    perPage: 'Résultats par page :',
    previous: 'Précédent',
    next: 'Suivant',
  },
  location: {
    denied: 'Autorisation de localisation refusée.',
    cityUnknown: 'Impossible de déterminer votre ville.',
    error: 'Erreur lors de la récupération de la position.',
    title: 'Utiliser ma position',
    button: 'Ma position',
  },
  legal: {
    lastUpdated: 'Dernière mise à jour : {date}',
    notFound: 'Document introuvable',
  },
}

export default common
