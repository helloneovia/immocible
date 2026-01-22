# Guide : Créer la table profiles dans Supabase

## ⚠️ Erreur actuelle
```
Could not find the table 'public.profiles' in the schema cache
```

Cette erreur signifie que la table `profiles` n'existe pas encore dans votre base de données Supabase.

## 📋 Étapes pour créer la table

### Étape 1 : Accéder à Supabase
1. Allez sur https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez votre projet : **echwcndgpgriqhsduvso**

### Étape 2 : Ouvrir l'éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur le bouton **"New query"** (ou utilisez le raccourci `Ctrl+K`)

### Étape 3 : Copier le script SQL
Copiez **TOUT** le contenu ci-dessous :

```sql
-- Créer la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('acquereur', 'agence')),
  nom TEXT,
  prenom TEXT,
  nom_agence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Politique pour permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politique pour permettre l'insertion lors de l'inscription
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Étape 4 : Exécuter le script
1. Collez le script dans l'éditeur SQL
2. Cliquez sur le bouton **"Run"** (ou appuyez sur `Ctrl+Enter`)
3. Vous devriez voir un message de succès : "Success. No rows returned"

### Étape 5 : Vérifier que ça fonctionne
Exécutez cette requête pour vérifier :
```sql
SELECT * FROM profiles;
```

Si vous voyez une table vide (sans erreur), c'est que la table a été créée avec succès ! ✅

## 🎯 Après la création de la table

Une fois la table créée :
1. Retournez sur votre site immocible.com
2. Réessayez de créer un compte
3. L'inscription devrait maintenant fonctionner !

## ❓ Problèmes courants

### "permission denied for table profiles"
→ Vérifiez que les politiques RLS ont bien été créées (réexécutez le script complet)

### "relation already exists"
→ C'est normal, la table existe déjà. Vous pouvez continuer.

### Le script ne s'exécute pas
→ Vérifiez que vous êtes bien connecté à Supabase et que vous avez les droits d'administration

## 📞 Besoin d'aide ?

Si vous rencontrez toujours des problèmes après avoir exécuté ce script, vérifiez :
1. Que vous êtes bien dans le bon projet Supabase
2. Que l'éditeur SQL affiche "Success" après l'exécution
3. Que la table apparaît dans **Table Editor** > **profiles**
