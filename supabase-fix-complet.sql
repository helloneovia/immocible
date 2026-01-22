-- ============================================
-- Script COMPLET pour corriger les problèmes RLS
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- Dashboard Supabase > SQL Editor > New Query

-- ÉTAPE 1 : Créer la table profiles si elle n'existe pas
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

-- ÉTAPE 2 : Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 3 : Supprimer TOUTES les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- ÉTAPE 4 : Créer une fonction trigger pour créer automatiquement le profil
-- Cette fonction s'exécute avec les privilèges du propriétaire (bypass RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'acquereur')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 5 : Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ÉTAPE 6 : Créer les politiques RLS (mises à jour)
-- Politique pour SELECT : les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique pour UPDATE : les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique pour INSERT : les utilisateurs authentifiés peuvent créer leur propre profil
-- Note: Le trigger ci-dessus devrait créer le profil automatiquement, mais cette politique
-- permet aussi la création manuelle si nécessaire
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ÉTAPE 7 : Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ÉTAPE 8 : Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Vérification
-- ============================================
-- Pour vérifier que tout fonctionne, exécutez :
-- SELECT * FROM profiles;
-- 
-- Pour vérifier les politiques :
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
--
-- Pour vérifier le trigger :
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
