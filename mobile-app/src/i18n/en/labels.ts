import type fr from '../fr/labels'

/** English texts — « labels » namespace (same keys as the French reference). */
const labels: typeof fr = {
  situationFamiliale: {
    celibataire: 'Single',
    marie: 'Married',
    pacs: 'Civil partnership',
    concubinage: 'Cohabiting',
    divorce: 'Divorced',
    veuf: 'Widowed',
  },
  nombreEnfants: {
    none: 'None',
    one: '1 child',
    many: '{count} children',
    fourPlus: '4 or more children',
  },
  situationPro: {
    cdi: 'Permanent contract',
    cdd: 'Fixed-term contract',
    freelance: 'Freelance / Self-employed',
    retraite: 'Retired',
    chomage: 'Job seeking',
    etudiant: 'Student',
    autre: 'Other',
  },
  financement: {
    pretBancaire: 'Bank loan',
    pretRelais: 'Bridging loan',
    cash: 'Cash purchase',
    mixte: 'Mixed financing',
    autre: 'Other',
  },
  dureePret: '{years} years',
  delaiRecherche: {
    urgent: 'Urgent (less than 1 month)',
    oneToThree: '1 to 3 months',
    threeToSix: '3 to 6 months',
    sixToTwelve: '6 to 12 months',
    twelvePlus: 'More than 12 months',
  },
  delaiShort: {
    urgent: 'Urgent (< 1 month)',
    oneToThree: '1 to 3 months',
    threeToSix: '3 to 6 months',
    sixToTwelve: '6 to 12 months',
    twelvePlus: '12+ months',
    undefined: 'Not set',
  },
  flexibilite: {
    strict: 'Strict (all criteria must be met)',
    modere: 'Moderate (some adjustments possible)',
    flexible: 'Flexible (open to opportunities)',
  },
  typeBien: {
    appartement: 'Apartment',
    maison: 'House',
    terrain: 'Land',
    studio: 'Studio',
    loft: 'Loft',
    duplex: 'Duplex',
    penthouse: 'Penthouse',
  },
  extras: {
    balcon: 'Balcony',
    terrasse: 'Terrace',
    jardin: 'Garden',
    parking: 'Parking',
    cave: 'Cellar',
    ascenseur: 'Lift',
  },
  notSpecified: 'Not specified',
  buyer: 'Buyer',
  format: {
    today: 'Today',
    yesterday: 'Yesterday',
    thousands: '€{value}k',
    millions: '€{value}M',
  },
}

export default labels
