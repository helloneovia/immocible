# Configuration Supabase

Ce projet utilise Supabase pour l'authentification et la gestion de la base de données.

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
NEXT_PUBLIC_SUPABASE_URL=https://echwcndgpgriqhsduvso.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjaHdjbmRncGdyaXFoc2R1dnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwNjgyMDcsImV4cCI6MjA4NDY0NDIwN30.k3u45V-n0oSaBKSiXzyOsp6d7_oare3QFYG7eIw1wI4
```

## Structure de la base de données

### Table `profiles`

Cette table stocke les profils utilisateurs avec les colonnes suivantes :

- `id` (uuid, primary key) - Correspond à l'ID de l'utilisateur dans `auth.users`
- `email` (text, required) - Email de l'utilisateur
- `role` (text, required) - Rôle de l'utilisateur : `'acquereur'` ou `'agence'`
- `nom` (text, nullable) - Nom de l'acquéreur
- `prenom` (text, nullable) - Prénom de l'acquéreur
- `nom_agence` (text, nullable) - Nom de l'agence (pour les agences)
- `created_at` (timestamp) - Date de création
- `updated_at` (timestamp) - Date de mise à jour

### SQL pour créer la table

Exécutez ce SQL dans l'éditeur SQL de Supabase :

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
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Fonctionnalités implémentées

- ✅ Authentification avec Supabase Auth
- ✅ Inscription acquéreur et agence
- ✅ Connexion acquéreur et agence
- ✅ Protection des routes avec vérification du rôle
- ✅ Déconnexion
- ✅ Gestion de session avec contexte React

## Pages disponibles

- `/acquereur/inscription` - Inscription pour les acquéreurs
- `/acquereur/connexion` - Connexion pour les acquéreurs
- `/acquereur/dashboard` - Dashboard protégé pour les acquéreurs
- `/agence/inscription` - Inscription pour les agences
- `/agence/connexion` - Connexion pour les agences
- `/agence/dashboard` - Dashboard protégé pour les agences
