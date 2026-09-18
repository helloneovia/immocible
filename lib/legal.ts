import { prisma } from '@/lib/prisma'
import { intlLocale, type Locale } from '@/lib/i18n/core'

/**
 * Pages légales (mentions légales, CGU/CGV, confidentialité).
 *
 * Le texte est défini ici une seule fois ; les informations propres à la société
 * (raison sociale, SIRET, hébergeur…) sont des réglages `legal_*` modifiables dans
 * l'admin (Paramètres › Informations légales). Le site et l'application mobile
 * affichent le même contenu résolu (API publique /api/public/legal/[slug]).
 */

export const LEGAL_FIELDS = {
    legal_company_name: { label: 'Raison sociale', placeholder: '[Raison sociale]', labelEn: 'Company name', placeholderEn: '[Company name]', value: 'NEOVIA' },
    legal_company_form: { label: 'Forme juridique', placeholder: '[forme juridique, ex. SAS]', labelEn: 'Legal form', placeholderEn: '[legal form, e.g. SAS]', value: 'SAS' },
    legal_company_capital: { label: 'Capital social (€)', placeholder: '[montant]', labelEn: 'Share capital (€)', placeholderEn: '[amount]', value: '' },
    legal_rcs_city: { label: "Ville d'immatriculation au RCS", placeholder: '[ville]', labelEn: 'RCS registration city', placeholderEn: '[city]', value: 'Bordeaux' },
    legal_siret: { label: 'SIREN / SIRET', placeholder: '[SIREN / SIRET]', labelEn: 'SIREN / SIRET', placeholderEn: '[SIREN / SIRET]', value: '990 188 724 00019' },
    legal_address: { label: 'Adresse du siège social', placeholder: '[adresse complète]', labelEn: 'Registered office address', placeholderEn: '[full address]', value: '9 rue de Condé, 33000 Bordeaux' },
    legal_vat_number: { label: 'Numéro de TVA intracommunautaire', placeholder: '[FR..]', labelEn: 'EU VAT number', placeholderEn: '[FR..]', value: '' },
    legal_email: { label: 'E-mail de contact', placeholder: '[e-mail]', labelEn: 'Contact email', placeholderEn: '[email]', value: 'contact@immocible.com' },
    legal_phone: { label: 'Téléphone', placeholder: '[numéro]', labelEn: 'Phone', placeholderEn: '[number]', value: '' },
    legal_publication_director: { label: 'Directeur de la publication', placeholder: '[nom du représentant légal]', labelEn: 'Publication director', placeholderEn: '[name of the legal representative]', value: '' },
    legal_host_name: { label: "Nom de l'hébergeur", placeholder: "[nom de l'hébergeur]", labelEn: 'Hosting provider name', placeholderEn: '[hosting provider name]', value: 'Hostinger' },
    legal_host_address: { label: "Adresse de l'hébergeur", placeholder: "[adresse de l'hébergeur]", labelEn: 'Hosting provider address', placeholderEn: '[hosting provider address]', value: '' },
    legal_host_contact: { label: "Téléphone ou site de l'hébergeur", placeholder: '[téléphone / site]', labelEn: 'Hosting provider phone or website', placeholderEn: '[phone / website]', value: '' },
    legal_cgu_duration: { label: "CGU — durée de l'abonnement", placeholder: '[mensuelle / annuelle]', labelEn: 'Terms — subscription term', placeholderEn: '[monthly / annual]', value: "mensuelle ou annuelle selon l'offre choisie", valueEn: 'monthly or yearly, depending on the chosen plan' },
    legal_cgu_renewal: { label: 'CGU — reconduction', placeholder: '[reconductible ou non]', labelEn: 'Terms — renewal', placeholderEn: '[renewable or not]', value: 'non reconduit tacitement', valueEn: 'not automatically renewed' },
    legal_cgu_termination: { label: 'CGU — modalités de résiliation', placeholder: '[modalités de résiliation]', labelEn: 'Terms — cancellation terms', placeholderEn: '[cancellation terms]', value: '' },
    legal_cgu_mediator: { label: 'CGU — médiateur de la consommation', placeholder: '[médiateur à désigner]', labelEn: 'Terms — consumer mediator', placeholderEn: '[mediator to be appointed]', value: '' },
    legal_email_provider: { label: "Confidentialité — service d'e-mailing", placeholder: '[Mailjet ou autre]', labelEn: 'Privacy — email service', placeholderEn: '[Mailjet or other]', value: '' },
    legal_data_retention: { label: 'Confidentialité — conservation après le dernier contact', placeholder: '[ex. 3 ans]', labelEn: 'Privacy — retention after last contact', placeholderEn: '[e.g. 3 years]', value: '' },
} as const

export type LegalFieldKey = keyof typeof LEGAL_FIELDS

/** Date (ISO) de la dernière modification d'une information légale, tenue à jour par l'API admin. */
export const LEGAL_LAST_UPDATED_KEY = 'legal_last_updated'

type Inline = string | { field: LegalFieldKey } | { text: string; href: string }
type Block = { kind: 'paragraph'; content: Inline[] } | { kind: 'list'; items: Inline[][] }
interface LegalDocument {
    title: string
    description: string
    /** Affiché tant qu'une information de la page reste à renseigner. */
    draftNotice: string
    sections: { title: string; blocks: Block[] }[]
}

const f = (field: LegalFieldKey) => ({ field })
const p = (...content: Inline[]): Block => ({ kind: 'paragraph', content })
const list = (...items: Inline[][]): Block => ({ kind: 'list', items })

export const LEGAL_DOCUMENTS = {
    'mentions-legales': {
        title: 'Mentions légales',
        description: 'Mentions légales du site IMMOCIBLE : éditeur, hébergeur et propriété intellectuelle.',
        draftNotice: 'Les éléments surlignés restent à renseigner.',
        sections: [
            {
                title: 'Éditeur du site',
                blocks: [
                    p('Le site et l’application IMMOCIBLE sont édités par ', f('legal_company_name'), ', société ', f('legal_company_form'),
                        ' au capital de ', f('legal_company_capital'), ' €, immatriculée au RCS de ', f('legal_rcs_city'),
                        ' sous le numéro ', f('legal_siret'), '.'),
                    p('Siège social : ', f('legal_address'), '.'),
                    p('Numéro de TVA intracommunautaire : ', f('legal_vat_number'), '.'),
                    p('Adresse e-mail : ', f('legal_email'), ' — Téléphone : ', f('legal_phone'), '.'),
                    p('Directeur de la publication : ', f('legal_publication_director'), '.'),
                ],
            },
            {
                title: 'Hébergement',
                blocks: [p('Le service est hébergé par ', f('legal_host_name'), ', ', f('legal_host_address'), ', ', f('legal_host_contact'), '.')],
            },
            {
                title: 'Propriété intellectuelle',
                blocks: [p('L’ensemble des contenus présents sur le service (marque IMMOCIBLE, logo, textes, visuels, éléments graphiques, structure) est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable, est interdite.')],
            },
            {
                title: 'Responsabilité',
                blocks: [p('L’éditeur s’efforce d’assurer l’exactitude des informations diffusées mais ne saurait être tenu responsable des erreurs, d’une absence de disponibilité des informations ou de la présence de virus sur le service.')],
            },
            {
                title: 'Contact',
                blocks: [p('Pour toute question relative au service, vous pouvez écrire à l’adresse ', f('legal_email'), '.')],
            },
        ],
    },
    cgu: {
        title: 'Conditions générales (CGU / CGV)',
        description: "Conditions générales d'utilisation et de vente d'IMMOCIBLE : inscription, service acquéreur, abonnement agence et paiement.",
        draftNotice: 'Les éléments surlignés restent à renseigner. Modèle à faire valider par un conseil juridique, notamment sur les clauses de vente d’abonnement, de rétractation et de responsabilité.',
        sections: [
            {
                title: '1. Objet',
                blocks: [p('Les présentes conditions régissent l’accès et l’utilisation de la plateforme IMMOCIBLE, éditée par ', f('legal_company_name'), ', service de mise en relation entre acquéreurs et agences immobilières autour d’opportunités off-market.')],
            },
            {
                title: '2. Inscription et compte',
                blocks: [p('L’inscription requiert une adresse e-mail valide et la définition d’un mot de passe. L’utilisateur est responsable de la confidentialité de ses identifiants et des actions réalisées depuis son compte.')],
            },
            {
                title: '3. Service acquéreur',
                blocks: [p('La création d’un profil acquéreur et la réception de propositions sont gratuites. Les coordonnées de l’acquéreur ne sont partagées avec une agence qu’après démarche explicite de celle-ci.')],
            },
            {
                title: '4. Abonnement agence',
                blocks: [
                    p('L’accès aux dossiers des acquéreurs est réservé aux agences disposant d’un abonnement payant en cours de validité, dont le prix en vigueur est affiché avant paiement. Le paiement est opéré via notre prestataire Stripe. L’abonnement est conclu pour une durée ',
                        f('legal_cgu_duration'), ' et ', f('legal_cgu_renewal'), ', dans les conditions précisées lors de la souscription.'),
                    p('Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux professionnels agissant dans le cadre de leur activité. Modalités de résiliation : ', f('legal_cgu_termination'), '.'),
                ],
            },
            {
                title: '5. Obligations des utilisateurs',
                blocks: [p('Les utilisateurs s’engagent à fournir des informations exactes, à ne pas détourner le service et à ne pas contourner les mécanismes de mise en relation (notamment la communication de coordonnées hors des canaux prévus).')],
            },
            {
                title: '6. Responsabilité',
                blocks: [p('IMMOCIBLE fournit un service de mise en relation et n’est pas partie aux transactions immobilières conclues entre utilisateurs. Sa responsabilité ne saurait être engagée à raison du contenu des annonces ni de l’issue des mises en relation.')],
            },
            {
                title: '7. Données personnelles',
                blocks: [p('Le traitement des données personnelles est décrit dans la ', { text: 'politique de confidentialité', href: '/confidentialite' }, '.')],
            },
            {
                title: '8. Droit applicable et litiges',
                blocks: [p('Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. Le consommateur peut recourir gratuitement à un médiateur de la consommation : ', f('legal_cgu_mediator'), '.')],
            },
        ],
    },
    confidentialite: {
        title: 'Politique de confidentialité',
        description: "Politique de confidentialité d'IMMOCIBLE : données collectées, finalités, durées de conservation et exercice de vos droits (RGPD).",
        draftNotice: 'Les éléments surlignés restent à renseigner. Document à valider par l’exploitant (et, le cas échéant, son conseil).',
        sections: [
            {
                title: 'Responsable du traitement',
                blocks: [p('Le responsable du traitement est ', f('legal_company_name'), ', ', f('legal_address'), '. Pour toute question relative à vos données : ', f('legal_email'), '.')],
            },
            {
                title: 'Données collectées',
                blocks: [
                    p('Nous collectons les données que vous nous fournissez et celles générées par l’usage du service :'),
                    list(
                        ['Données d’identification : nom, prénom, adresse e-mail, téléphone.'],
                        ['Données de compte : rôle (acquéreur / agence), mot de passe (stocké chiffré), nom de l’agence.'],
                        ['Critères de recherche immobilière (budget, localisation, type de bien, etc.).'],
                        ['Données de paiement d’abonnement, traitées par notre prestataire Stripe (nous ne stockons pas vos numéros de carte).'],
                        ['Données de navigation et de mesure d’audience, soumises à votre consentement (voir « Cookies »).'],
                    ),
                ],
            },
            {
                title: 'Finalités et bases légales',
                blocks: [list(
                    ['Fournir le service de mise en relation (exécution du contrat).'],
                    ['Gérer les comptes, l’authentification et le support (exécution du contrat).'],
                    ['Gérer les abonnements et la facturation (exécution du contrat, obligation légale).'],
                    ['Envoyer des communications et newsletters (consentement, retirable à tout moment).'],
                    ['Mesurer l’audience et améliorer le service (consentement / intérêt légitime).'],
                )],
            },
            {
                title: 'Destinataires',
                blocks: [p('Vos données sont accessibles aux équipes habilitées d’IMMOCIBLE et à ses sous-traitants techniques : hébergeur (', f('legal_host_name'), '), prestataire de paiement (Stripe), service d’e-mailing (', f('legal_email_provider'), ') et service de notifications. Les coordonnées d’un acquéreur ne sont transmises à une agence qu’après déblocage explicite par cette dernière.')],
            },
            {
                title: 'Durées de conservation',
                blocks: [list(
                    ['Données de compte : pendant la durée de vie du compte, puis ', f('legal_data_retention'), ' après le dernier contact.'],
                    ['Données de facturation : 10 ans (obligation comptable).'],
                    ['Données de mesure d’audience : 13 mois maximum.'],
                )],
            },
            {
                title: 'Vos droits',
                blocks: [p('Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité de vos données, ainsi que du droit de définir des directives post-mortem. Vous pouvez les exercer à ', f('legal_email'), '. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).')],
            },
            {
                title: "Cookies et mesure d'audience",
                blocks: [p('Le site dépose des cookies et effectue une mesure d’audience. Les traceurs non strictement nécessaires ne sont activés qu’après votre consentement, recueilli via le bandeau prévu à cet effet. Vous pouvez modifier votre choix à tout moment en effaçant les cookies de votre navigateur.')],
            },
            {
                title: 'Transferts hors Union européenne',
                blocks: [p('Certains sous-traitants peuvent traiter des données hors de l’Union européenne. Le cas échéant, ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types de la Commission européenne).')],
            },
        ],
    },
} satisfies Record<string, LegalDocument>

export type LegalSlug = keyof typeof LEGAL_DOCUMENTS

/** Version anglaise des documents : traduction fidèle du français (mêmes sections, mêmes champs `legal_*`). */
export const LEGAL_DOCUMENTS_EN = {
    'mentions-legales': {
        title: 'Legal notice',
        description: 'Legal notice of the IMMOCIBLE website: publisher, hosting provider and intellectual property.',
        draftNotice: 'Highlighted items are still to be completed.',
        sections: [
            {
                title: 'Website publisher',
                blocks: [
                    p('The IMMOCIBLE website and application are published by ', f('legal_company_name'), ', a ', f('legal_company_form'),
                        ' company with a share capital of €', f('legal_company_capital'), ', registered with the ', f('legal_rcs_city'),
                        ' Trade and Companies Register (RCS) under number ', f('legal_siret'), '.'),
                    p('Registered office: ', f('legal_address'), '.'),
                    p('EU VAT number: ', f('legal_vat_number'), '.'),
                    p('Email address: ', f('legal_email'), ' — Phone: ', f('legal_phone'), '.'),
                    p('Publication director: ', f('legal_publication_director'), '.'),
                ],
            },
            {
                title: 'Hosting',
                blocks: [p('The service is hosted by ', f('legal_host_name'), ', ', f('legal_host_address'), ', ', f('legal_host_contact'), '.')],
            },
            {
                title: 'Intellectual property',
                blocks: [p('All content on the service (the IMMOCIBLE brand, logo, texts, visuals, graphic elements, structure) is protected by intellectual property law. Any full or partial reproduction or representation without prior written authorisation is prohibited.')],
            },
            {
                title: 'Liability',
                blocks: [p('The publisher strives to ensure the accuracy of the information provided but cannot be held liable for errors, unavailability of information or the presence of viruses on the service.')],
            },
            {
                title: 'Contact',
                blocks: [p('For any question about the service, you can write to ', f('legal_email'), '.')],
            },
        ],
    },
    cgu: {
        title: 'Terms and Conditions (Terms of Use / Terms of Sale)',
        description: 'IMMOCIBLE terms of use and sale: registration, buyer service, agency subscription and payment.',
        draftNotice: 'Highlighted items are still to be completed. Template to be reviewed by a legal adviser, in particular the clauses on subscription sales, withdrawal and liability.',
        sections: [
            {
                title: '1. Purpose',
                blocks: [p('These terms govern access to and use of the IMMOCIBLE platform, published by ', f('legal_company_name'), ', a service connecting buyers and real estate agencies around off-market opportunities.')],
            },
            {
                title: '2. Registration and account',
                blocks: [p('Registration requires a valid email address and a password. Users are responsible for keeping their login details confidential and for all actions carried out from their account.')],
            },
            {
                title: '3. Buyer service',
                blocks: [p('Creating a buyer profile and receiving proposals are free of charge. A buyer’s contact details are only shared with an agency after an explicit action by that agency.')],
            },
            {
                title: '4. Agency subscription',
                blocks: [
                    p('Access to buyer files is reserved for agencies holding a valid paid subscription, whose current price is displayed before payment. Payment is processed by our provider Stripe. The subscription is entered into for a ',
                        f('legal_cgu_duration'), ' term and is ', f('legal_cgu_renewal'), ', under the conditions specified at the time of subscription.'),
                    p('In accordance with Article L221-28 of the French Consumer Code, the right of withdrawal does not apply to professionals acting in the course of their business. Cancellation terms: ', f('legal_cgu_termination'), '.'),
                ],
            },
            {
                title: '5. User obligations',
                blocks: [p('Users undertake to provide accurate information, not to misuse the service and not to circumvent the matching mechanisms (in particular by sharing contact details outside the intended channels).')],
            },
            {
                title: '6. Liability',
                blocks: [p('IMMOCIBLE provides a matching service and is not a party to real estate transactions concluded between users. It cannot be held liable for the content of listings or the outcome of introductions.')],
            },
            {
                title: '7. Personal data',
                blocks: [p('The processing of personal data is described in the ', { text: 'privacy policy', href: '/confidentialite' }, '.')],
            },
            {
                title: '8. Governing law and disputes',
                blocks: [p('These terms are governed by French law. In the event of a dispute, an amicable solution will be sought before any legal action. Consumers may use a consumer mediator free of charge: ', f('legal_cgu_mediator'), '.')],
            },
        ],
    },
    confidentialite: {
        title: 'Privacy policy',
        description: 'IMMOCIBLE privacy policy: data collected, purposes, retention periods and how to exercise your rights (GDPR).',
        draftNotice: 'Highlighted items are still to be completed. Document to be validated by the operator (and, where applicable, its adviser).',
        sections: [
            {
                title: 'Data controller',
                blocks: [p('The data controller is ', f('legal_company_name'), ', ', f('legal_address'), '. For any question about your data: ', f('legal_email'), '.')],
            },
            {
                title: 'Data collected',
                blocks: [
                    p('We collect the data you provide to us and the data generated by your use of the service:'),
                    list(
                        ['Identification data: last name, first name, email address, phone number.'],
                        ['Account data: role (buyer / agency), password (stored encrypted), agency name.'],
                        ['Property search criteria (budget, location, property type, etc.).'],
                        ['Subscription payment data, processed by our provider Stripe (we do not store your card numbers).'],
                        ['Browsing and audience measurement data, subject to your consent (see “Cookies”).'],
                    ),
                ],
            },
            {
                title: 'Purposes and legal bases',
                blocks: [list(
                    ['Providing the matching service (performance of the contract).'],
                    ['Managing accounts, authentication and support (performance of the contract).'],
                    ['Managing subscriptions and billing (performance of the contract, legal obligation).'],
                    ['Sending communications and newsletters (consent, which may be withdrawn at any time).'],
                    ['Measuring audience and improving the service (consent / legitimate interest).'],
                )],
            },
            {
                title: 'Recipients',
                blocks: [p('Your data is accessible to authorised IMMOCIBLE staff and to its technical processors: hosting provider (', f('legal_host_name'), '), payment provider (Stripe), email service (', f('legal_email_provider'), ') and notification service. A buyer’s contact details are only passed on to an agency after the agency has explicitly unlocked them.')],
            },
            {
                title: 'Retention periods',
                blocks: [list(
                    ['Account data: for the lifetime of the account, then ', f('legal_data_retention'), ' after the last contact.'],
                    ['Billing data: 10 years (accounting obligation).'],
                    ['Audience measurement data: 13 months maximum.'],
                )],
            },
            {
                title: 'Your rights',
                blocks: [p('In accordance with the GDPR, you have the right to access, rectify, erase, object to, restrict and port your data, as well as the right to set post-mortem directives. You can exercise these rights at ', f('legal_email'), '. You may also lodge a complaint with the CNIL, the French data protection authority (www.cnil.fr).')],
            },
            {
                title: 'Cookies and audience measurement',
                blocks: [p('The website places cookies and measures its audience. Trackers that are not strictly necessary are only activated after your consent, collected via the dedicated banner. You can change your choice at any time by clearing your browser’s cookies.')],
            },
            {
                title: 'Transfers outside the European Union',
                blocks: [p('Some processors may process data outside the European Union. Where applicable, these transfers are governed by appropriate safeguards (European Commission standard contractual clauses).')],
            },
        ],
    },
} satisfies Record<LegalSlug, LegalDocument>

/** Titre et description d'un document dans la langue demandée (métadonnées des pages). */
export function getLegalMeta(slug: LegalSlug, locale: Locale = 'fr') {
    const doc: LegalDocument = locale === 'en' ? LEGAL_DOCUMENTS_EN[slug] : LEGAL_DOCUMENTS[slug]
    return { title: doc.title, description: doc.description }
}

export function isLegalSlug(value: string): value is LegalSlug {
    return Object.prototype.hasOwnProperty.call(LEGAL_DOCUMENTS, value)
}

/** Segment prêt à afficher : texte, lien interne ou information manquante (surlignée). */
export type LegalSegment = { text: string; href?: string; missing?: boolean }
export type ResolvedBlock = { kind: 'paragraph'; segments: LegalSegment[] } | { kind: 'list'; items: LegalSegment[][] }

export interface ResolvedLegalDocument {
    slug: LegalSlug
    title: string
    lastUpdated: string
    /** Présent tant qu'au moins une information reste à renseigner. */
    notice: string | null
    sections: { title: string; blocks: ResolvedBlock[] }[]
}

/** Valeurs saisies dans l'admin, avec repli sur les valeurs par défaut. */
async function getLegalValues() {
    const values: Record<string, string> = {}
    let lastUpdated: Date | null = null
    for (const [key, def] of Object.entries(LEGAL_FIELDS)) values[key] = def.value
    try {
        const rows = await prisma.systemSetting.findMany({ where: { key: { startsWith: 'legal_' } } })
        for (const row of rows) {
            if (row.key in LEGAL_FIELDS) values[row.key] = row.value.trim()
            if (row.key === LEGAL_LAST_UPDATED_KEY) {
                const date = new Date(row.value)
                if (!Number.isNaN(date.getTime())) lastUpdated = date
            }
        }
    } catch (error) {
        console.error('[Legal] Réglages indisponibles, valeurs par défaut utilisées:', error)
    }
    return { values, lastUpdated }
}

export async function getLegalDocument(slug: LegalSlug, locale: Locale = 'fr'): Promise<ResolvedLegalDocument> {
    const doc: LegalDocument = locale === 'en' ? LEGAL_DOCUMENTS_EN[slug] : LEGAL_DOCUMENTS[slug]
    const { values, lastUpdated } = await getLegalValues()
    let missing = false

    const resolve = (content: Inline[]): LegalSegment[] =>
        content.map((part) => {
            if (typeof part === 'string') return { text: part }
            if ('href' in part) return { text: part.text, href: part.href }
            const field = LEGAL_FIELDS[part.field] as { value: string; valueEn?: string; placeholder: string; placeholderEn: string }
            let value = values[part.field]
            // Texte par défaut encore en français (jamais modifié dans l'admin) : version anglaise équivalente.
            if (locale === 'en' && field.valueEn && value === field.value) value = field.valueEn
            if (value) return { text: value }
            missing = true
            return { text: locale === 'en' ? field.placeholderEn : field.placeholder, missing: true }
        })

    const sections = doc.sections.map((section) => ({
        title: section.title,
        blocks: section.blocks.map((block): ResolvedBlock =>
            block.kind === 'paragraph'
                ? { kind: 'paragraph', segments: resolve(block.content) }
                : { kind: 'list', items: block.items.map(resolve) },
        ),
    }))

    // Date affichée : dernière modification d'une information légale (ou date de rédaction initiale).
    const date = lastUpdated ?? new Date('2026-08-14T00:00:00Z')
    return {
        slug,
        title: doc.title,
        lastUpdated: date.toLocaleDateString(intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }),
        notice: missing ? doc.draftNotice : null,
        sections,
    }
}
