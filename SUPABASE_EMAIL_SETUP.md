# Configuration Email Supabase

## Problème : "Email rate limit exceeded"

Si vous rencontrez l'erreur "email rate limit exceeded", cela signifie que Supabase a atteint sa limite d'envoi d'emails de confirmation.

## Solutions

### Solution 1 : Désactiver la confirmation d'email (Recommandé pour le développement)

1. Allez dans votre dashboard Supabase
2. Naviguez vers **Authentication** > **Settings**
3. Dans la section **Email Auth**, trouvez **"Confirm email"**
4. **Désactivez** cette option
5. Cliquez sur **Save**

Cela permettra aux utilisateurs de se connecter immédiatement après l'inscription sans confirmation d'email.

### Solution 2 : Attendre quelques minutes

La limite d'email de Supabase se réinitialise après quelques minutes. Vous pouvez simplement attendre et réessayer.

### Solution 3 : Utiliser un service d'email personnalisé

Pour la production, configurez un service d'email personnalisé (SendGrid, Mailgun, etc.) dans Supabase :
1. Allez dans **Settings** > **Auth**
2. Configurez un **SMTP provider**
3. Cela augmentera considérablement votre limite d'emails

## Configuration recommandée pour le développement

Pour éviter ce problème pendant le développement, désactivez la confirmation d'email dans Supabase.
