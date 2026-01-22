-- ============================================
-- SOLUTION SIMPLE ET ROBUSTE
-- ============================================
-- Ce script garantit que tout fonctionne, même sans trigger
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

-- 4. Créer la fonction create_user_profile avec SECURITY DEFINER
-- Cette fonction bypass complètement RLS
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_role TEXT DEFAULT 'acquereur',
  p_nom_agence TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Récupérer l'ID et l'email de l'utilisateur actuel
  v_user_id := auth.uid();
  
  -- Vérifier que l'utilisateur est authentifié
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Utilisateur non authentifié'
    );
  END IF;
  
  -- Récupérer l'email depuis auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Créer ou mettre à jour le profil
  INSERT INTO public.profiles (id, email, role, nom_agence)
  VALUES (
    v_user_id,
    COALESCE(v_user_email, ''),
    p_role,
    p_nom_agence
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    role = COALESCE(EXCLUDED.role, profiles.role),
    nom_agence = COALESCE(EXCLUDED.nom_agence, profiles.nom_agence),
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
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

-- 5. Donner les permissions d'exécution à tous les utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile(TEXT, TEXT) TO anon;

-- 6. Créer les politiques RLS (version permissive)
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

-- INSERT : politique permissive pour permettre l'insertion via la fonction
-- La fonction SECURITY DEFINER bypass RLS, mais on garde cette politique au cas où
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
-- Vérifier que la fonction existe et a les bonnes permissions
SELECT 
  proname as fonction,
  prosecdef as security_definer,
  proacl as permissions
FROM pg_proc 
WHERE proname = 'create_user_profile';

-- Vérifier les politiques RLS
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'profiles';
