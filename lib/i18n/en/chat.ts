import type fr from '../fr/chat'

/** English texts — « chat » namespace (same keys as the French reference). */
const chat: typeof fr = {
  roles: {
    agency: 'Agency',
    buyer: 'Buyer',
  },
  list: {
    title: 'Messages',
    search: 'Search...',
    loading: 'Loading...',
    empty: 'No conversations',
    clickToView: 'Click to view messages',
    yourMessages: 'Your messages',
    selectConversation: 'Select a conversation to start chatting.',
  },
  window: {
    startConversation: 'Start the conversation with {name}',
    placeholder: 'Write your message...',
    send: 'Send',
  },
}

export default chat
