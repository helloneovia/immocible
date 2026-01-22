# ⚡ Configuration Mailjet - Guide Rapide

## 📧 Informations de connexion Mailjet

```
API Key: 12d28c018abfca468fc3339de883c363
Secret Key: 9c619c5f64126a06f5113c81cb224d5a
```

## 🚀 Configuration en 5 minutes

### 1. Accéder à Supabase
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet : **echwcndgpgriqhsduvso**

### 2. Configurer SMTP
1. Menu gauche : **Settings** > **Auth**
2. Section **SMTP Settings**
3. Activez **"Enable Custom SMTP"**
4. Remplissez :

```
SMTP Host: in-v3.mailjet.com
SMTP Port: 587
SMTP User: 12d28c018abfca468fc3339de883c363
SMTP Password: 9c619c5f64126a06f5113c81cb224d5a
Sender email: noreply@immocible.com (ou votre email vérifié)
Sender name: IMMOCIBLE
```

5. Cliquez sur **Save**

### 3. Vérifier dans Mailjet
1. Connectez-vous à https://app.mailjet.com/
2. Allez dans **Account Settings** > **Senders & Domains**
3. Vérifiez que votre email sender est vérifié

### 4. Tester
1. Dans Supabase : **Authentication** > **Users**
2. Créez un utilisateur test
3. Cliquez sur **Send magic link** pour tester

## ✅ C'est fait !

Les emails seront maintenant envoyés via Mailjet au lieu du service par défaut de Supabase.

## 📊 Avantages

- ✅ Plus de limite d'email rate limit
- ✅ Emails professionnels avec votre domaine
- ✅ Statistiques d'envoi dans Mailjet
- ✅ Meilleure délivrabilité
