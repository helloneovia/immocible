# Test de la configuration Mailjet

## ✅ Vérification rapide

### 1. Tester l'envoi d'email depuis Supabase

1. Allez dans votre dashboard Supabase
2. **Authentication** > **Users**
3. Créez un utilisateur de test ou sélectionnez un utilisateur existant
4. Cliquez sur **"Send magic link"** ou **"Reset password"**
5. Vérifiez que l'email arrive bien dans la boîte de réception

### 2. Tester l'inscription sur le site

1. Allez sur votre site immocible.com
2. Essayez de créer un compte acquéreur
3. Vérifiez que l'email de confirmation arrive (si la confirmation d'email est activée)

### 3. Vérifier les statistiques Mailjet

1. Connectez-vous à https://app.mailjet.com/
2. Allez dans **Statistics** > **Logs**
3. Vous devriez voir les emails envoyés avec leur statut (délivré, ouvert, etc.)

## 🎯 Résultat attendu

- ✅ Les emails sont envoyés via Mailjet
- ✅ Plus d'erreur "email rate limit exceeded"
- ✅ Les emails arrivent dans la boîte de réception
- ✅ Les statistiques sont visibles dans Mailjet

## 📧 Types d'emails envoyés

Avec Mailjet configuré, Supabase enverra automatiquement :
- **Confirmation d'inscription** (si activée)
- **Magic link** (connexion sans mot de passe)
- **Réinitialisation de mot de passe**
- **Changement d'email**

Tous ces emails passeront maintenant par Mailjet ! 🚀
