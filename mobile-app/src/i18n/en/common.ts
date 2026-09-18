import type fr from '../fr/common'

/** English texts — « common » namespace (same keys as the French reference). */
const common: typeof fr = {
  actions: {
    close: 'Close',
    back: 'Back',
    remove: 'Remove {label}',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  loading: 'Loading',
  loadingEllipsis: 'Loading...',
  select: 'Select',
  or: 'Or',
  stepOf: 'Step {current} of {total}',
  otpLabel: '6-digit verification code',
  offline: 'You are offline — check your connection.',
  errors: {
    generic: 'Something went wrong.',
    timeout: 'The server is taking too long to respond. Try again in a moment.',
    network: 'Unable to reach the server. Check your connection.',
    tooManyAttempts: 'Too many attempts. Please try again later.',
  },
  push: {
    channelMessages: 'Messages',
  },
}

export default common
