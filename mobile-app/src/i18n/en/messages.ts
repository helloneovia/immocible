import type fr from '../fr/messages'

/** English texts — « messages » namespace (same keys as the French reference). */
const messages: typeof fr = {
  roles: {
    buyer: 'Buyer',
    agency: 'Agency',
    platform: 'Platform',
  },
  list: {
    title: 'Messages',
    searchPlaceholder: 'Search',
    noResults: 'No results',
    noConversations: 'No conversations',
    noMatch: 'No conversations match “{query}”.',
    emptyAgency: 'Open a buyer file and tap “Chat” to start a conversation.',
    emptyBuyer: 'Partner agencies will write to you here as soon as a property matches your project.',
    seeBuyers: 'See buyers',
    unreadOne: '{name}, {count} unread message',
    unreadMany: '{name}, {count} unread messages',
    conversationWith: 'Conversation with {role}',
  },
  conversation: {
    defaultTitle: 'Conversation',
    start: 'Start the conversation with {name}',
    sendFailed: 'The message could not be sent.',
    manageSubscription: 'Manage my subscription',
    placeholder: 'Write your message...',
    inputA11y: 'Message',
    send: 'Send',
  },
}

export default messages
