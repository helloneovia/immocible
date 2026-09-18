# IMMOCIBLE — applications iOS & Android

Application mobile native (Expo SDK 57 / React Native 0.86) pour les acquéreurs et
les agences. Interface pensée pour le mobile : onglets natifs, grands titres,
listes groupées, questionnaire une question par écran, feuilles de choix natives.

Elle consomme **l'API Next.js existante** (`https://immocible.com/api/...`) sans
aucune modification côté serveur. La session repose sur le cookie httpOnly
`immocible_session_v3`, conservé par la pile réseau native entre les lancements.

## Démarrer

Prérequis : Node 20+, Xcode (iOS), Android Studio + SDK (Android).

```bash
cd mobile-app
npm install
npm run ios        # build de développement + simulateur iOS
npm run android    # build de développement + émulateur Android
```

Les dossiers natifs `ios/` et `android/` sont générés (`npm run prebuild`) et ne
sont pas versionnés : toute la configuration vit dans `app.json`.

Variables d'environnement (facultatives, préfixe `EXPO_PUBLIC_`) :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `https://immocible.com` | Serveur Next.js ciblé (ex. `http://192.168.1.20:3000` en local) |
| `EXPO_PUBLIC_ADNEO_WEBSITE_ID` | identifiant du site | Articles du blog |

`npm run typecheck` vérifie le TypeScript.

## Parcours et écrans (`src/app`)

| Écran | Route | Rôle |
| --- | --- | --- |
| Accueil (pages à faire défiler) | `index.tsx` | Présentation, création de compte, connexion |
| Connexion | `connexion.tsx` | Bascule Acquéreur / Agence |
| Inscriptions | `inscription-acquereur.tsx` (4 étapes), `inscription-agence.tsx` (5 étapes) | E-mail, code à 6 chiffres, identité, mot de passe, offre |
| Mot de passe | `mot-de-passe-oublie.tsx`, `reset-password.tsx` | Lien de réinitialisation |
| **Acquéreur** | `acquereur/` (onglets natifs) | `accueil`, `projet`, `messages`, `profil` |
| Questionnaire | `questionnaire.tsx` (modal plein écran) | 9 questions, une par écran ; `?section=` pour n'en modifier qu'une |
| **Agence** | `agence/` (onglets natifs) | `acquereurs`, `messages`, `profil` |
| Dossier acquéreur | `profil/[id].tsx` | Critères, financement, situation, coordonnées à débloquer |
| Conversation | `conversation/[id].tsx` | Messagerie, rafraîchie automatiquement |
| Paiement | `paiement.tsx` | Stripe Embedded Checkout en WebView |
| Blog | `blog/` | Articles Adneo |

L'administration (`/admin`) reste sur le web. Les pages légales s'ouvrent dans le
navigateur intégré (elles restent ainsi synchronisées avec le site).

L'accès aux écrans est contrôlé dans `src/app/_layout.tsx` avec `Stack.Protected`
selon le rôle ; quand la session change, la pile revient au premier écran autorisé.

## Langues (français par défaut, anglais)

- Textes dans `src/i18n/fr/*.ts` (référence) et `src/i18n/en/*.ts` : l'anglais est typé
  `typeof fr`, TypeScript refuse une clé manquante. `t('espace.cle', { param })` depuis `@/i18n`.
- Le français reste la langue par défaut ; l'anglais se choisit dans l'app (bouton EN de
  l'accueil, ligne Langue du profil) et est mémorisé (AsyncStorage). La langue de l'appareil
  n'est pas utilisée.
- Chaque requête envoie `X-Immocible-Lang` : messages d'erreur, pages légales et textes
  administrables (versions `*_en` dans l'admin) reviennent dans la langue choisie.
- Ne jamais appeler `t()` au niveau module : la navigation est remontée au changement de langue.

## Repères de conception

- **La cible** (logo) est l'élément signature : `components/brand/TargetRing.tsx`.
  Trois anneaux — le bien, le budget, le lieu — se remplissent avec le projet ;
  côté agence, `ScoreRing` affiche la complétude d'un dossier (`lib/projet.ts`).
- **Jetons** dans `src/theme.ts` : fond gris groupé, surfaces blanches, marine pour
  les actions, or comme unique accent.
- **Typographie** : Inter pour l'interface (échelle proche des tailles natives),
  Playfair Display réservé aux moments de marque (accueil, titre du projet).
- **Navigation** : `NativeTabs` (verre liquide sur iOS 26, Material 3 sur Android)
  et en-têtes natifs à grand titre (`lib/navigation.ts`).

## Points de mise en production

- **Notifications push** : le jeton natif (APNs / FCM) est envoyé à
  `/api/notifications/register`. Il faut ajouter `google-services.json` (Android)
  et une clé APNs (iOS). Le serveur n'envoie encore aucune notification.
- **Paiements et App Store** : l'abonnement agence et le déblocage de contact
  passent par Stripe. Apple impose en principe l'achat intégré pour les contenus
  numériques (règle 3.1.1) ; à trancher avant soumission.
- **Clé Stripe de test** : lors des essais, le formulaire affichait « TEST MODE ».
  Renseigner la clé live dans les réglages admin avant ouverture aux agences.
- **Suppression de compte** : Apple exige de pouvoir la lancer depuis l'app.
  L'onglet Profil ouvre une demande par e-mail ; une route API dédiée est nécessaire.
- **Liens universels** : pour ouvrir les e-mails de réinitialisation dans l'app,
  publier `apple-app-site-association` et `assetlinks.json` puis déclarer les
  domaines associés dans `app.json`.
- **Builds de store** : `npx eas build`, ou archive Xcode / `./gradlew bundleRelease`
  après `npm run prebuild`.

### Dépannage Android

Après un changement de version d'une dépendance native (Reanimated / Worklets),
`expo prebuild --clean` ne vide pas les caches CMake situés dans `node_modules`.
Symptôme : `ninja: error: '…/libworklets.so' … missing and no known rule to make it`.

```bash
rm -rf node_modules/{expo-modules-core,react-native-worklets,react-native-reanimated}/android/{.cxx,build}
cd android && ./gradlew assembleRelease
```

Le dossier `../mobile` (coque Capacitor chargeant le site distant) est remplacé
par cette application.
