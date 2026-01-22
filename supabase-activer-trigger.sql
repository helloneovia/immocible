-- ============================================
-- ACTIVER LE TRIGGER - Solution immédiate
-- ============================================
-- Le trigger existe mais est désactivé (tgenabled = 0)
-- Exécutez ce script pour l'activer

-- Activer le trigger on_auth_user_created
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Vérifier que le trigger est activé
SELECT 
  tgname as trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE 'UNKNOWN'
  END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Résultat attendu : status = 'ENABLED'
