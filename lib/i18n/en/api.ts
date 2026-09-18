import type fr from '../fr/api'

/** English texts — « api » namespace (same keys as the French reference). */
const api: typeof fr = {
    common: {
        notAuthenticated: 'Not authenticated',
        unauthorized: 'Unauthorized',
        forbidden: 'Access denied',
        serverError: 'Internal server error',
        tooManyAttempts: 'Too many attempts. Please try again later.',
    },
    auth: {
        emailPasswordRequired: 'Email and password are required',
        loginFailed: 'Authentication failed',
        invalidCredentials: 'Incorrect email or password',
        wrongPortal: 'This is {actual} account, not {expected} account. Please sign in on the right portal.',
        roles: {
            acquereur: 'a buyer',
            agence: 'an agency',
            admin: 'an admin',
        },
        emailAlreadyExists: 'A user with this email already exists',
        getUserFailed: 'Failed to get user',
        register: {
            requiredFields: 'Email, password and role are required',
            passwordTooShort: 'Password must be at least 8 characters',
            invalidRole: 'Invalid role',
            failed: 'Registration failed',
        },
        forgotPassword: {
            emailRequired: 'Email is required',
            failed: 'Failed to process request',
        },
        resetPassword: {
            tokenPasswordRequired: 'Token and password are required',
            passwordTooShort: 'Password must be at least 8 characters',
            invalidLink: 'Invalid or expired link',
            linkExpired: 'Link expired',
            failed: 'Password reset failed',
        },
        verifyEmail: {
            invalidEmail: 'Invalid email',
            emailInUse: 'This email is already in use.',
            sendFailed: 'Failed to send the verification code.',
            invalidData: 'Invalid data',
            invalidCode: 'Invalid or expired code',
            checkFailed: 'Verification failed.',
        },
    },
    profile: {
        userNotFound: 'User not found',
        emailRequired: 'Email is required',
        wrongCurrentPassword: 'Current password is incorrect.',
        invalidEmail: 'Invalid email address.',
        emailInUse: 'This email is already in use.',
        passwordTooShort: 'Password must be at least 8 characters',
    },
    subscription: {
        required: 'An active subscription is required to view and contact buyers.',
    },
    chat: {
        conversationNotFound: 'Conversation not found',
        subscriptionInactive: 'Subscription expired or inactive.',
        monthlyLimitReached: 'Monthly contact limit reached. Upgrade to the annual plan for unlimited chats.',
    },
    buyer: {
        matchesFailed: 'Failed to get matches',
    },
    agency: {
        buyerNotFound: 'Buyer not found',
        biensFailed: 'Failed to get properties',
        missingFields: 'Missing required fields',
        createBienFailed: 'Failed to create property',
    },
    payment: {
        emailPlanRequired: 'Email and plan are required',
        invalidPlan: 'Invalid plan',
        invalidCoupon: 'Invalid promo code',
        couponLimitReached: 'This promo code has reached its usage limit',
        couponExpired: 'This promo code has expired',
        couponPlanOnly: 'This code is only valid for the {plan} plan',
        planMonthly: 'Monthly',
        planYearly: 'Annual',
        loginToActivate: 'Please sign in to activate this offer.',
        offerActivated: 'Offer activated: {days} free days!',
        discountFailed: 'Failed to apply the discount',
        initiationFailed: 'Payment initiation failed',
        unlockedFree: 'Contact unlocked for free',
        notCompleted: 'Payment not completed',
        verificationFailed: 'Payment verification failed',
        productMonthly: 'Monthly plan (Agency)',
        productYearly: 'Yearly plan (Agency)',
        productDescription: 'IMMOCIBLE access for the agency {agency}',
        unlockProductName: 'Contact unlock: {name}',
        unlockProductDescription: 'Access to full contact details (Ref: {ref})',
        buyerFallback: 'Buyer',
    },
}

export default api
