-- ============================================
-- TEST DE LA FONCTION create_user_profile
-- ============================================
-- Ce script teste si la fonction fonctionne correctement
-- ATTENTION : Vous devez être connecté en tant qu'utilisateur pour tester

-- 1. Vérifier que la fonction existe
SELECT 
  proname as fonction,
  prosecdef as security_definer,
  proargtypes::regtype[] as parametres,
  prorettype::regtype as type_retour
FROM pg_proc 
WHERE proname = 'create_user_profile';

-- 2. Vérifier les permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'create_user_profile'
AND routine_schema = 'public';

-- 3. Tester la fonction (nécessite d'être connecté)
-- Remplacez 'acquereur' par le rôle que vous voulez tester
SELECT public.create_user_profile('acquereur'::TEXT, NULL::TEXT) as resultat;

-- 4. Vérifier si un profil a été créé
SELECT * FROM public.profiles WHERE id = auth.uid();
