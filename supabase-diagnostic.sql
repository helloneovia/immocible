-- ============================================
-- SCRIPT DE DIAGNOSTIC - Vérifier la configuration
-- ============================================
-- Exécutez ce script pour vérifier que tout est bien configuré

-- 1. Vérifier que la table profiles existe
SELECT 
  'Table profiles' as element,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as statut;

-- 2. Vérifier que la fonction create_user_profile existe
SELECT 
  'Fonction create_user_profile' as element,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_profile')
    THEN '✅ Existe'
    ELSE '❌ N''existe pas'
  END as statut;

-- 3. Vérifier les permissions de la fonction
SELECT 
  proname as fonction,
  prosecdef as security_definer,
  CASE WHEN prosecdef THEN '✅ SECURITY DEFINER' ELSE '❌ Pas SECURITY DEFINER' END as statut
FROM pg_proc 
WHERE proname = 'create_user_profile';

-- 4. Vérifier les politiques RLS
SELECT 
  policyname,
  cmd as operation,
  CASE permissive WHEN 'PERMISSIVE' THEN '✅' ELSE '❌' END as permissive,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 5. Vérifier que RLS est activé
SELECT 
  'RLS activé' as element,
  CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles')
    THEN '✅ Activé'
    ELSE '❌ Désactivé'
  END as statut;

-- 6. Vérifier le trigger (si il existe)
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '✅ ENABLED'
    WHEN 'D' THEN '⚠️ DISABLED'
    ELSE '❌ UNKNOWN'
  END as statut
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 7. Tester la fonction (nécessite d'être connecté en tant qu'utilisateur)
-- Cette requête peut échouer si vous n'êtes pas connecté, c'est normal
SELECT 
  'Test fonction (doit être connecté)' as element,
  CASE WHEN auth.uid() IS NOT NULL 
    THEN '✅ Utilisateur connecté - peut tester'
    ELSE '⚠️ Pas connecté - testez manuellement'
  END as statut;
