-- ============================================
-- Correction des politiques RLS pour IMMOCIBLE
-- ============================================
-- Exécutez ce script si vous avez l'erreur "Erreur de permissions"
-- Dashboard Supabase > SQL Editor > New Query

-- 1. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Créer une fonction pour créer automatiquement le profil
-- Cette fonction sera appelée automatiquement lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'acquereur')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer un trigger pour appeler cette fonction lors de la création d'un utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Créer les politiques RLS (mises à jour)
-- Politique pour permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politique pour permettre l'insertion (avec la fonction trigger, cette politique peut être plus permissive)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Permettre l'insertion via la fonction (bypass RLS pour la fonction)
-- La fonction handle_new_user() utilise SECURITY DEFINER, donc elle peut insérer même si RLS bloque

-- ============================================
-- Alternative : Politique plus permissive pour l'insertion
-- ============================================
-- Si le trigger ne fonctionne pas, vous pouvez utiliser cette politique plus permissive :
-- (Décommentez les lignes ci-dessous si nécessaire)

-- DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
-- CREATE POLICY "Users can insert own profile"
--   ON profiles FOR INSERT
--   WITH CHECK (true);  -- Permet à tous les utilisateurs authentifiés d'insérer

-- ============================================
-- Vérification
-- ============================================
-- Pour vérifier que les politiques sont créées :
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
