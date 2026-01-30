# 🏠 IMMOCIBLE

**Plateforme de matching acquéreurs ↔ opportunités immobilières qualifiées**

IMMOCIBLE est une plateforme innovante qui connecte les acquéreurs qualifiés avec des opportunités immobilières **off-market** exclusives. Fini les recherches interminables, découvrez les meilleurs biens correspondant à votre profil grâce à notre algorithme de matching intelligent.

![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Fonctionnalités

### Pour les Acquéreurs
- 📝 **Profil détaillé** : Créez votre profil avec vos critères de recherche et votre profil financier
- 🎯 **Matching intelligent** : Algorithme avancé qui propose des biens parfaitement adaptés
- 🏡 **Accès off-market** : Découvrez des opportunités exclusives avant qu'elles ne soient sur le marché
- ⚡ **Matching en 24h** : Recevez vos premières propositions rapidement
- 💯 **100% Gratuit** : Aucun frais pour les acquéreurs

### Pour les Agences
- 👥 **Acquéreurs vérifiés** : Accédez à une base d'acquéreurs qualifiés et sérieux
- 📊 **Tableau de bord** : Gérez vos biens et suivez vos matches
- 🔒 **Sécurisé** : Plateforme sécurisée avec authentification

## 🚀 Technologies

- **Framework** : Next.js 14 (App Router)
- **UI** : React 18 + TypeScript
- **Styling** : Tailwind CSS + Radix UI
- **Base de données** : Prisma ORM
- **Authentification** : NextAuth.js
- **Validation** : Zod + React Hook Form
- **Icons** : Lucide React

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/helloneovia/immocible.git
cd immocible
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```
Remplissez les variables nécessaires dans `.env`

4. **Initialiser la base de données**
```bash
npm run db:generate
npm run db:push
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
immocible/
├── app/                      # App Router (Next.js 14)
│   ├── acquereur/           # Pages acquéreurs
│   │   ├── inscription/     # Inscription acquéreur
│   │   ├── dashboard/       # Dashboard acquéreur
│   │   └── questionnaire/   # Questionnaire de profil
│   ├── agence/              # Pages agences
│   │   ├── inscription/     # Inscription agence
│   │   └── dashboard/       # Dashboard agence
│   ├── api/                 # API Routes
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil
├── components/              # Composants réutilisables
│   └── ui/                  # Composants UI (Radix)
├── lib/                     # Utilitaires
│   ├── prisma.ts           # Client Prisma
│   └── utils.ts            # Fonctions utilitaires
├── public/                  # Assets statiques
└── prisma/                  # Schéma de base de données
```

## 🎨 Design

Le design d'IMMOCIBLE suit les principes modernes du web design :
- **Glassmorphism** : Effets de verre dépoli pour un look premium
- **Gradients dynamiques** : Couleurs vibrantes et harmonieuses
- **Micro-animations** : Transitions fluides et engageantes
- **Responsive** : Optimisé pour tous les appareils
- **Dark mode ready** : Architecture prête pour le mode sombre

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma vers la DB
npm run db:migrate   # Créer une migration
npm run db:studio    # Ouvrir Prisma Studio
npx prisma db push
```

## 🔐 Authentification

L'authentification est gérée par NextAuth.js avec support pour :
- Email/Password
- OAuth providers (à configurer)
- Sessions sécurisées

## 📊 Base de Données

Le schéma Prisma inclut :
- **Users** : Utilisateurs (acquéreurs et agences)
- **Properties** : Biens immobiliers
- **Matches** : Correspondances acquéreur-bien
- **Profiles** : Profils détaillés des acquéreurs

## 🚢 Déploiement

### Vercel (Recommandé)
```bash
vercel deploy
```

### Autres plateformes
Le projet peut être déployé sur n'importe quelle plateforme supportant Next.js :
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence ISC.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.

---

**Made with ❤️ for the real estate industry**
