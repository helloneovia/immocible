# Configuration Mailjet avec Supabase

Ce guide vous explique comment configurer Mailjet pour l'envoi d'emails depuis Supabase.

## 📋 Informations Mailjet

- **API Key**: `12d28c018abfca468fc3339de883c363`
- **Secret Key**: `9c619c5f64126a06f5113c81cb224d5a`

## 🔧 Configuration dans Supabase

### Étape 1 : Obtenir les informations SMTP de Mailjet

1. Connectez-vous à votre compte Mailjet : https://app.mailjet.com/
2. Allez dans **Account Settings** > **SMTP and Senders**
3. Notez les informations SMTP :
   - **SMTP Server**: `in-v3.mailjet.com`
   - **Port**: `587` (TLS) ou `465` (SSL)
   - **Username**: Votre API Key
   - **Password**: Votre Secret Key

### Étape 2 : Configurer SMTP dans Supabase

1. Allez dans votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Auth**
4. Faites défiler jusqu'à la section **SMTP Settings**
5. Activez **"Enable Custom SMTP"**
6. Remplissez les champs suivants :

```
SMTP Host: in-v3.mailjet.com
SMTP Port: 587
SMTP User: 12d28c018abfca468fc3339de883c363
SMTP Password: 9c619c5f64126a06f5113c81cb224d5a
Sender email: noreply@immocible.com (ou votre email vérifié dans Mailjet)
Sender name: IMMOCIBLE
```

7. Cliquez sur **Save**

### Étape 3 : Vérifier l'email sender dans Mailjet

1. Dans Mailjet, allez dans **Account Settings** > **Senders & Domains**
2. Vérifiez que votre domaine ou email est vérifié
3. Si nécessaire, ajoutez et vérifiez un nouveau sender

### Étape 4 : Tester la configuration

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Créez un utilisateur de test ou utilisez un utilisateur existant
3. Cliquez sur **Send magic link** ou **Reset password** pour tester l'envoi d'email

## 📧 Templates d'emails personnalisés

Vous pouvez personnaliser les templates d'emails dans Supabase :
1. Allez dans **Authentication** > **Email Templates**
2. Personnalisez les templates :
   - **Confirm signup** (Confirmation d'inscription)
   - **Magic Link** (Lien de connexion)
   - **Change Email Address** (Changement d'email)
   - **Reset Password** (Réinitialisation de mot de passe)

## 🔒 Sécurité

⚠️ **Important** : Ne partagez jamais vos clés API publiquement. Elles sont stockées de manière sécurisée dans Supabase.

## 📊 Limites Mailjet

- **Plan gratuit** : 200 emails/jour, 6000 emails/mois
- **Plan payant** : Limites plus élevées selon votre abonnement

## ✅ Vérification

Après configuration, testez l'inscription sur votre site. L'email de confirmation devrait être envoyé via Mailjet au lieu du service par défaut de Supabase.

## 🐛 Dépannage

### Les emails ne sont pas envoyés
- Vérifiez que SMTP est activé dans Supabase
- Vérifiez que l'email sender est vérifié dans Mailjet
- Consultez les logs dans Mailjet > **Statistics** > **Logs**

### Erreur d'authentification SMTP
- Vérifiez que l'API Key et Secret Key sont corrects
- Assurez-vous d'utiliser le port 587 avec TLS

### Emails en spam
- Configurez SPF et DKIM dans Mailjet
- Vérifiez votre domaine dans Mailjet
