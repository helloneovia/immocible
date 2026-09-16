export type Role = 'acquereur' | 'agence' | 'admin'

export interface Profile {
  id: string
  userId: string
  nom?: string | null
  prenom?: string | null
  telephone?: string | null
  nomAgence?: string | null
  plan?: string | null
  subscriptionStatus?: string | null
  subscriptionEndDate?: string | null
  subscriptionStartDate?: string | null
  ville?: string | null
}

export interface User {
  id: string
  email: string
  role: Role
  createdAt: string
  updatedAt: string
  profile?: Profile | null
}

/** GeoJSON Polygon : coordinates[0] = anneau extérieur en [lng, lat]. */
export interface DrawnArea {
  type: 'Polygon'
  coordinates: [number, number][][]
}

export interface QuestionnaireData {
  situationFamiliale: string
  nombreEnfants: string
  situationProfessionnelle: string
  typeBien: string[]
  budgetMin: string
  budgetMax: string
  surfaceMin: string
  surfaceMax: string
  nombrePieces: string[]
  localisation: string[]
  drawnArea: DrawnArea | null
  quartiers?: string[]
  balcon: boolean
  terrasse: boolean
  jardin: boolean
  parking: boolean
  cave: boolean
  ascenseur: boolean
  apport: string
  financement: string
  dureePret: string
  delaiRecherche: string
  flexibilite: string
  salaire: string
  patrimoine: string
  commentaires: string
}

export interface Caracteristiques {
  situationFamiliale?: string
  nombreEnfants?: string
  situationProfessionnelle?: string
  salaire?: string
  patrimoine?: string
  drawnArea?: DrawnArea | null
  balcon?: boolean
  terrasse?: boolean
  jardin?: boolean
  parking?: boolean
  cave?: boolean
  ascenseur?: boolean
  apport?: string
  dureePret?: string
  delaiRecherche?: string
  flexibilite?: string
  commentaires?: string
}

export interface Recherche {
  id: string
  ownerId: string
  prixMin?: number | null
  prixMax: number
  surfaceMin?: number | null
  surfaceMax?: number | null
  typeBien: string[]
  localisation: string[]
  nombrePieces: string[]
  financement?: string | null
  caracteristiques?: Caracteristiques | string | null
  isActive: boolean
  updatedAt: string
  owner?: {
    id: string
    profile?: { nom?: string | null; prenom?: string | null; ville?: string | null } | null
  }
}

export interface BuyerDetails {
  unlocked: boolean
  price: number
  search: Recherche | null
  profile: {
    nom?: string | null
    prenom?: string | null
    ville?: string | null
    email: string
    telephone?: string | null
  }
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  agencyId: string
  buyerId: string
  updatedAt: string
  agency?: { id: string; email?: string; profile?: Profile | null }
  buyer?: { id: string; email?: string; profile?: Profile | null }
  messages?: Message[]
  _count?: { messages: number }
}

export interface AccountProfile {
  nom: string
  prenom: string
  email: string
  telephone: string
  nomAgence: string
  role: Role
  plan?: string | null
  subscriptionEndDate?: string | null
  subscriptionStartDate?: string | null
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt?: string
  featuredImage?: string
  content?: string
  url?: string
}
