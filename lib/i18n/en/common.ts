import type fr from '../fr/common'

/** English texts — « common » namespace (same keys as the French reference). */
const common: typeof fr = {
  brand: {
    homeAria: 'IMMOCIBLE — home',
  },
  nav: {
    login: 'Log in',
    getStarted: 'Get started',
    messages: 'Messages',
    settings: 'Settings',
    logout: 'Log out',
  },
  footer: {
    legalLinksAria: 'Legal links',
    legalNotice: 'Legal notice',
    privacy: 'Privacy',
    terms: 'Terms & Conditions',
    blog: 'Blog',
    copyright: '© {year} IMMOCIBLE. Real estate, reimagined. All rights reserved.',
  },
  notFound: {
    metaTitle: 'Page not found',
    title: "This page doesn't exist (anymore)",
    text: 'The link you followed may be broken, or the page may have moved.',
    backHome: 'Back to home',
    seeBlog: 'Visit the blog',
  },
  error: {
    title: 'Something went wrong',
    text: "We couldn't display this page. You can try again or go back to the home page.",
    retry: 'Try again',
    backHome: 'Back to home',
  },
  cookies: {
    aria: 'Cookie consent',
    textBefore: 'We use audience measurement cookies to improve the service. You can accept or refuse them. Learn more in our',
    privacyLink: 'privacy policy',
    refuse: 'Refuse',
    accept: 'Accept',
  },
  payment: {
    preparing: 'Preparing your secure payment...',
    title: 'Secure payment',
    stripe: 'Secured by Stripe',
  },
  loading: 'Loading...',
  pagination: {
    showing: 'Showing {from} to {to} of {total} results',
    zero: '0 results',
    perPage: 'Results per page:',
    previous: 'Previous',
    next: 'Next',
  },
  location: {
    denied: 'Location permission denied.',
    cityUnknown: 'Unable to determine your city.',
    error: 'Error while retrieving your location.',
    title: 'Use my location',
    button: 'My location',
  },
  legal: {
    lastUpdated: 'Last updated: {date}',
    notFound: 'Document not found',
  },
}

export default common
