-- ============================================
-- VÉRIFICATION RAPIDE - Tous les résultats en une fois
-- ============================================
-- Exécutez ce script pour voir TOUS les résultats d'un coup

-- 1. Table profiles existe ?
SELECT 
  '1. Table profiles' as element,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
    THEN '✅ Existe'
    ELSE '❌ N''existe pas - EXÉCUTEZ supabase-solution-simple.sql'
  END as statut;

-- 2. Fonction create_user_profile existe ?
SELECT 
  '2. Fonction create_user_profile' as element,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_profile')
    THEN '✅ Existe'
    ELSE '❌ N''existe pas - EXÉCUTEZ supabase-solution-simple.sql'
  END as statut;

-- 3. Fonction a SECURITY DEFINER ?
SELECT 
  '3. SECURITY DEFINER' as element,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'create_user_profile' AND prosecdef = true
  )
    THEN '✅ Oui'
    ELSE '❌ Non - EXÉCUTEZ supabase-solution-simple.sql'
  END as statut;

-- 4. Permissions GRANT ?
SELECT 
  '4. Permissions GRANT' as element,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'create_user_profile'
    AND n.nspname = 'public'
    AND (
      p.proacl::text LIKE '%authenticated%' 
      OR p.proacl::text LIKE '%anon%'
      OR p.proacl IS NULL
    )
  )
    THEN '✅ Configuré'
    ELSE '⚠️ Vérifiez manuellement'
  END as statut;

-- 5. Politiques RLS existent ?
SELECT 
  '5. Politiques RLS' as element,
  CASE WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles')
    THEN '✅ ' || COUNT(*)::text || ' politique(s)'
    ELSE '❌ Aucune politique - EXÉCUTEZ supabase-solution-simple.sql'
  END as statut
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. RLS activé ?
SELECT 
  '6. RLS activé' as element,
  CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles')
    THEN '✅ Oui'
    ELSE '❌ Non - EXÉCUTEZ supabase-solution-simple.sql'
  END as statut;

-- 7. Détails de la fonction
SELECT 
  '7. Détails fonction' as element,
  proname || ' - ' || 
  CASE WHEN prosecdef THEN 'SECURITY DEFINER ✅' ELSE 'Pas SECURITY DEFINER ❌' END
  as statut
FROM pg_proc 
WHERE proname = 'create_user_profile';

-- 8. Liste des politiques RLS
SELECT 
  '8. Politiques détaillées' as element,
  policyname || ' (' || cmd || ')' as statut
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
