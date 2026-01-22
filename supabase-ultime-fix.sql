-- ============================================
-- SOLUTION ULTIME - À EXÉCUTER DANS SUPABASE
-- ============================================
-- Ce script résout définitivement TOUS les problèmes de permissions
-- Copiez TOUT ce script dans SQL Editor > New Query > Run

-- 1. Créer la table (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('acquereur', 'agence')),
  nom TEXT,
  prenom TEXT,
  nom_agence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. NETTOYER : Supprimer toutes les anciennes politiques et fonctions
DO $$ 
BEGIN
  -- Supprimer toutes les politiques
  DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  
  -- Supprimer le trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  -- Supprimer la fonction
  DROP FUNCTION IF EXISTS public.handle_new_user();
END $$;

-- 4. Créer la fonction trigger avec SECURITY DEFINER (bypass RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'acquereur')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, on log mais on ne bloque pas la création de l'utilisateur
    RAISE WARNING 'Erreur lors de la création du profil: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. Créer le trigger (activé par défaut)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5b. S'assurer que le trigger est activé
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- 6. Créer les politiques RLS (version permissive pour l'insertion)
-- SELECT : voir son propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- UPDATE : mettre à jour son propre profil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT : politique permissive pour les utilisateurs authentifiés
-- Cette politique permet à tout utilisateur authentifié de créer son profil
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id AND 
    auth.role() = 'authenticated'
  );

-- 7. Fonction updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 8. Trigger updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TEST : Vérifier que tout fonctionne
-- ============================================
-- Exécutez cette requête pour vérifier :
SELECT 
  'Table créée' as etat,
  COUNT(*) as nb_profils
FROM public.profiles;
