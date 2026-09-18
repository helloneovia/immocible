/** Textes français — espace de noms « messages ». Référence : l'anglais doit avoir exactement les mêmes clés. */
const messages = {
  roles: {
    buyer: 'Acquéreur',
    agency: 'Agence',
    platform: 'Plateforme',
  },
  list: {
    title: 'Messages',
    searchPlaceholder: 'Rechercher',
    noResults: 'Aucun résultat',
    noConversations: 'Aucune conversation',
    noMatch: 'Aucune conversation ne correspond à « {query} ».',
    emptyAgency: 'Ouvrez un dossier acquéreur puis touchez « Discuter » pour démarrer un échange.',
    emptyBuyer: "Les agences partenaires vous écrivent ici dès qu'un bien correspond à votre projet.",
    seeBuyers: 'Voir les acquéreurs',
    unreadOne: '{name}, {count} message non lu',
    unreadMany: '{name}, {count} messages non lus',
    conversationWith: 'Conversation avec {role}',
  },
  conversation: {
    defaultTitle: 'Conversation',
    start: 'Démarrez la conversation avec {name}',
    sendFailed: "Le message n'a pas pu être envoyé.",
    manageSubscription: 'Gérer mon abonnement',
    placeholder: 'Écrivez votre message...',
    inputA11y: 'Message',
    send: 'Envoyer',
  },
}

export default messages
