# 🚀 Quick Start Guide - IMMOCIBLE

Ce guide vous permettra de démarrer rapidement avec IMMOCIBLE.

## ⚡ Installation Rapide

```bash
# 1. Cloner le projet
git clone https://github.com/helloneovia/immocible.git
cd immocible

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditez .env avec vos variables

# 4. Initialiser la base de données
npm run db:generate
npm run db:push

# 5. Lancer le projet
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## 📱 Navigation Rapide

### Pages Principales

- **Accueil** : `/` - Landing page avec présentation
- **Inscription Acquéreur** : `/acquereur/inscription` - Créer un compte acquéreur
- **Dashboard Acquéreur** : `/acquereur/dashboard` - Voir ses matches
- **Questionnaire** : `/acquereur/questionnaire` - Compléter son profil
- **Inscription Agence** : `/agence/inscription` - Créer un compte agence
- **Dashboard Agence** : `/agence/dashboard` - Gérer ses biens

## 🎯 Workflow Utilisateur

### Pour un Acquéreur

1. **S'inscrire** → `/acquereur/inscription`
2. **Compléter le questionnaire** → `/acquereur/questionnaire`
3. **Consulter les matches** → `/acquereur/dashboard`
4. **Contacter les agences** pour les biens qui vous intéressent

### Pour une Agence

1. **S'inscrire** → `/agence/inscription`
2. **Ajouter des biens** → Dashboard agence
3. **Recevoir des matches** avec des acquéreurs qualifiés
4. **Gérer les contacts** et négociations

## 🛠️ Commandes Essentielles

```bash
# Développement
npm run dev              # Démarrer le serveur de dev

# Base de données
npm run db:studio        # Ouvrir Prisma Studio (interface visuelle)
npm run db:push          # Synchroniser le schéma
npm run db:migrate       # Créer une migration

# Production
npm run build            # Build de production
npm run start            # Serveur de production

# Qualité du code
npm run lint             # Vérifier le code
```

## 🎨 Personnalisation

### Couleurs
Les couleurs principales sont définies dans `tailwind.config.js` :
- **Primaire** : Bleu → Indigo → Violet
- **Secondaire** : Rose → Violet

### Composants UI
Les composants Radix UI sont dans `components/ui/` :
- `button.tsx` - Boutons
- `card.tsx` - Cartes
- `input.tsx` - Champs de saisie
- `label.tsx` - Labels
- etc.

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` avec :

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (optionnel)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@immocible.com"
```

## 📚 Ressources

- **Documentation Next.js** : [nextjs.org/docs](https://nextjs.org/docs)
- **Documentation Prisma** : [prisma.io/docs](https://prisma.io/docs)
- **Documentation Tailwind** : [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Radix UI** : [radix-ui.com](https://radix-ui.com)

## 🐛 Problèmes Courants

### Le serveur ne démarre pas
```bash
# Vérifier que les dépendances sont installées
npm install

# Vérifier la version de Node
node --version  # Doit être >= 18
```

### Erreur de base de données
```bash
# Régénérer le client Prisma
npm run db:generate

# Réinitialiser la DB (⚠️ supprime les données)
npx prisma db push --force-reset
```

### Erreur de build
```bash
# Nettoyer le cache
rm -rf .next
npm run build
```

## 💡 Conseils

- Utilisez **Prisma Studio** (`npm run db:studio`) pour visualiser et éditer vos données
- Le **hot reload** est activé en mode dev - vos changements sont instantanés
- Consultez les **logs de la console** pour déboguer
- Utilisez les **React DevTools** pour inspecter les composants

## 🎓 Prochaines Étapes

1. Explorez le code dans `app/` pour comprendre la structure
2. Personnalisez les composants dans `components/ui/`
3. Ajoutez vos propres fonctionnalités
4. Déployez sur Vercel ou votre plateforme préférée

---

**Besoin d'aide ?** Consultez le [README.md](./README.md) complet ou ouvrez une issue sur GitHub.
