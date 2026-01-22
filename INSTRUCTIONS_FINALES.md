# 🚀 Instructions Finales - Configuration Supabase

## ⚠️ Si vous avez l'erreur "Erreur de permissions"

### Solution : Exécuter le script SQL complet

1. **Ouvrez Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : echwcndgpgriqhsduvso
3. **Allez dans SQL Editor** (menu de gauche)
4. **Cliquez sur "New query"**
5. **Copiez-collez TOUT le contenu** du fichier `supabase-setup.sql`
6. **Cliquez sur "Run"** (ou Ctrl+Enter)
7. **Vérifiez** que vous voyez "Success. No rows returned"

### Le script fait automatiquement :

✅ Crée la table `profiles` si elle n'existe pas  
✅ Configure le trigger pour créer automatiquement les profils  
✅ Configure les politiques RLS correctement  
✅ Bypasse les permissions grâce à SECURITY DEFINER  

### Après l'exécution

1. Retournez sur votre site immocible.com
2. Essayez de créer un compte
3. Ça devrait fonctionner ! 🎉

## 📝 Fichiers SQL disponibles

- **`supabase-setup.sql`** ← **UTILISEZ CELUI-CI** (script complet et à jour)
- `supabase-fix-rls.sql` (ancien script de correction)
- `supabase-fix-complet.sql` (script alternatif)

## 🔍 Vérification

Pour vérifier que tout est bien configuré, exécutez dans SQL Editor :

```sql
-- Vérifier que la table existe
SELECT * FROM profiles;

-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Vérifier le trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Si ces requêtes s'exécutent sans erreur, tout est configuré correctement ! ✅
