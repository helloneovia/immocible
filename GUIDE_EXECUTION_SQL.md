# 📋 Guide : Exécuter le script SQL dans Supabase

## ⚠️ IMPORTANT : Utiliser le BON fichier

Vous devez copier le contenu du fichier **`supabase-solution-finale.sql`** (fichier SQL)
**PAS** le fichier `page.tsx` (fichier JavaScript/React)

## 📝 Étapes détaillées

### 1. Ouvrir Supabase
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet "Immocible"

### 2. Ouvrir SQL Editor
- Dans le menu de gauche, cliquez sur **"SQL Editor"**
- Cliquez sur **"New query"** (ou le bouton "+" à côté des onglets)

### 3. Ouvrir le fichier SQL dans votre éditeur de code
- Dans VS Code (ou votre éditeur), ouvrez le fichier **`supabase-solution-finale.sql`**
- Ce fichier contient du code SQL, pas du JavaScript

### 4. Copier le contenu SQL
- Dans le fichier `supabase-solution-finale.sql`
- Sélectionnez TOUT le contenu (Ctrl+A)
- Copiez (Ctrl+C)

### 5. Coller dans Supabase SQL Editor
- Retournez dans Supabase SQL Editor
- Collez le contenu (Ctrl+V)
- Vous devriez voir du code SQL qui commence par `-- ============================================`

### 6. Exécuter le script
- Cliquez sur le bouton **"Run"** (ou appuyez sur Ctrl+Enter)
- Attendez quelques secondes
- Vous devriez voir "Success" dans les résultats

## ✅ Vérification

Après l'exécution, vous pouvez vérifier avec cette requête :

```sql
SELECT proname FROM pg_proc WHERE proname = 'create_user_profile';
```

Si vous voyez `create_user_profile` dans les résultats, c'est bon ! ✅

## 🔍 Comment reconnaître le bon fichier ?

**Fichier SQL (✅ à utiliser) :**
- Nom : `supabase-solution-finale.sql`
- Contenu commence par : `-- ============================================`
- Contient des mots-clés SQL : `CREATE TABLE`, `CREATE FUNCTION`, `CREATE POLICY`

**Fichier React (❌ à ne PAS utiliser) :**
- Nom : `page.tsx` ou `inscription/page.tsx`
- Contenu commence par : `'use client'` ou `import`
- Contient du code JavaScript/React

## 🆘 Si vous avez encore une erreur

1. Vérifiez que vous avez bien copié le contenu de `supabase-solution-finale.sql`
2. Vérifiez que vous êtes dans l'onglet SQL Editor (pas dans un autre onglet)
3. Essayez de supprimer tout le contenu de l'éditeur SQL et de recoller le script
