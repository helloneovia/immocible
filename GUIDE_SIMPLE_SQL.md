# 🎯 Guide Simple - Exécuter le Script SQL

## ⚡ Solution en 3 étapes

### Étape 1 : Ouvrir Supabase
1. Allez sur https://supabase.com/dashboard
2. Connectez-vous
3. Sélectionnez votre projet : **echwcndgpgriqhsduvso**

### Étape 2 : Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur le bouton **"New query"** (en haut à droite)

### Étape 3 : Copier et exécuter
1. Ouvrez le fichier **`supabase-setup.sql`** dans votre projet
2. **Sélectionnez TOUT** le contenu (Ctrl+A)
3. **Copiez** (Ctrl+C)
4. **Collez** dans l'éditeur SQL de Supabase (Ctrl+V)
5. Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)

## ✅ Résultat attendu

Vous devriez voir :
```
Success. No rows returned
```

## 🧪 Tester

1. Retournez sur votre site : immocible.com
2. Essayez de créer un compte
3. Ça devrait fonctionner ! 🎉

## ❓ Si ça ne fonctionne toujours pas

Vérifiez dans Supabase :
1. **Table Editor** > Vérifiez que la table `profiles` existe
2. **SQL Editor** > Exécutez : `SELECT * FROM profiles;`
3. Si vous voyez une table vide (sans erreur), c'est bon !

## 📝 Note importante

Le script crée automatiquement les profils grâce à un **trigger PostgreSQL**. Même si vous avez une erreur de permissions, le trigger devrait créer le profil automatiquement lors de l'inscription.
