import { prisma } from '@/lib/prisma'

/**
 * Pages légales (mentions légales, CGU/CGV, confidentialité).
 *
 * Le texte est défini ici une seule fois ; les informations propres à la société
 * (raison sociale, SIRET, hébergeur…) sont des réglages `legal_*` modifiables dans
 * l'admin (Paramètres › Informations légales). Le site et l'application mobile
 * affichent le même contenu résolu (API publique /api/public/legal/[slug]).
 */

export const LEGAL_FIELDS = {
    legal_company_name: { label: 'Raison sociale', placeholder: '[Raison sociale]', value: 'NEOVIA' },
    legal_company_form: { label: 'Forme juridique', placeholder: '[forme juridique, ex. SAS]', value: 'SAS' },
    legal_company_capital: { label: 'Capital social (€)', placeholder: '[montant]', value: '' },
    legal_rcs_city: { label: "Ville d'immatriculation au RCS", placeholder: '[ville]', value: 'Bordeaux' },
    legal_siret: { label: 'SIREN / SIRET', placeholder: '[SIREN / SIRET]', value: '990 188 724 00019' },
    legal_address: { label: 'Adresse du siège social', placeholder: '[adresse complète]', value: '9 rue de Condé, 33000 Bordeaux' },
    legal_vat_number: { label: 'Numéro de TVA intracommunautaire', placeholder: '[FR..]', value: '' },
    legal_email: { label: 'E-mail de contact', placeholder: '[e-mail]', value: 'contact@immocible.com' },
    legal_phone: { label: 'Téléphone', placeholder: '[numéro]', value: '' },
    legal_publication_director: { label: 'Directeur de la publication', placeholder: '[nom du représentant légal]', value: '' },
    legal_host_name: { label: "Nom de l'hébergeur", placeholder: "[nom de l'hébergeur]", value: 'Hostinger' },
    legal_host_address: { label: "Adresse de l'hébergeur", placeholder: "[adresse de l'hébergeur]", value: '' },
    legal_host_contact: { label: "Téléphone ou site de l'hébergeur", placeholder: '[téléphone / site]', value: '' },
    legal_cgu_duration: { label: "CGU — durée de l'abonnement", placeholder: '[mensuelle / annuelle]', value: "mensuelle ou annuelle selon l'offre choisie" },
    legal_cgu_renewal: { label: 'CGU — reconduction', placeholder: '[reconductible ou non]', value: 'non reconduit tacitement' },
    legal_cgu_termination: { label: 'CGU — modalités de résiliation', placeholder: '[modalités de résiliation]', value: '' },
    legal_cgu_mediator: { label: 'CGU — médiateur de la consommation', placeholder: '[médiateur à désigner]', value: '' },
    legal_email_provider: { label: "Confidentialité — service d'e-mailing", placeholder: '[Mailjet ou autre]', value: '' },
    legal_data_retention: { label: 'Confidentialité — conservation après le dernier contact', placeholder: '[ex. 3 ans]', value: '' },
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

export async function getLegalDocument(slug: LegalSlug): Promise<ResolvedLegalDocument> {
    const doc: LegalDocument = LEGAL_DOCUMENTS[slug]
    const { values, lastUpdated } = await getLegalValues()
    let missing = false

    const resolve = (content: Inline[]): LegalSegment[] =>
        content.map((part) => {
            if (typeof part === 'string') return { text: part }
            if ('href' in part) return { text: part.text, href: part.href }
            const value = values[part.field]
            if (value) return { text: value }
            missing = true
            return { text: LEGAL_FIELDS[part.field].placeholder, missing: true }
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
        lastUpdated: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }),
        notice: missing ? doc.draftNotice : null,
        sections,
    }
}
