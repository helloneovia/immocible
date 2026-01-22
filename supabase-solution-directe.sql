-- ============================================
-- SOLUTION DIRECTE - Contourne complètement RLS
-- ============================================
-- Ce script crée une fonction qui fonctionne à coup sûr
-- Exécutez TOUT ce script dans Supabase SQL Editor

-- 1. Créer la table profiles
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

-- 3. NETTOYER : Supprimer TOUT (dans le bon ordre)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 4. Créer une fonction SIMPLIFIÉE qui accepte directement l'ID et l'email
-- Cette fonction utilise SECURITY DEFINER et SET search_path pour bypass RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_user_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'acquereur',
  p_nom_agence TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier que l'utilisateur est authentifié et que l'ID correspond
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ID utilisateur invalide'
    );
  END IF;
  
  -- Créer ou mettre à jour le profil (bypass RLS grâce à SECURITY DEFINER)
  INSERT INTO public.profiles (id, email, role, nom_agence)
  VALUES (
    p_user_id,
    p_email,
    p_role,
    p_nom_agence
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    nom_agence = EXCLUDED.nom_agence,
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'role', p_role
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 5. Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;

-- 6. Créer les politiques RLS
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

-- INSERT : politique pour l'insertion (la fonction SECURITY DEFINER bypass, mais on garde cette politique)
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

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
-- VÉRIFICATIONS
-- ============================================
SELECT 
  'Fonction créée' as etat,
  proname as fonction,
  CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌' END as security
FROM pg_proc 
WHERE proname = 'create_user_profile';

SELECT 
  'Politiques RLS' as etat,
  COUNT(*)::text || ' politique(s)' as nombre
FROM pg_policies 
WHERE tablename = 'profiles';
