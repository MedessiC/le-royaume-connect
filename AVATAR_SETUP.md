# Configuration du Bucket Avatars dans Supabase

## ⚠️ Configuration requise

Pour que l'upload de photos de profil fonctionne correctement, vous devez configurer le bucket `avatars` dans Supabase.

### Étapes de configuration

1. **Créer le bucket**
   - Allez dans Supabase Dashboard > Storage > Buckets
   - Cliquez sur "New Bucket"
   - Nommez-le `avatars` (en minuscules)
   - Cochez "Public bucket" (les images doivent être accessibles publiquement)
   - Créez le bucket

2. **Configurer les politiques RLS (Row Level Security)**
   
   Dans le bucket `avatars`, configurez les politiques suivantes via l'onglet "Policies":

   **Politique 1 - Lecture publique:**
   - Type: SELECT
   - Pour: Everyone (public)
   - Condition: Pas de condition spécifique
   - Cliquez "Save policy"

   **Politique 2 - Upload authentifié:**
   - Type: INSERT
   - Pour: Authenticated users
   - Condition: `(bucket_id = 'avatars')`
   - Cliquez "Save policy"

   **Politique 3 - Mise à jour authentifiée:**
   - Type: UPDATE
   - Pour: Authenticated users
   - Condition: `(bucket_id = 'avatars')`
   - Cliquez "Save policy"

   **Politique 4 - Suppression propre:**
   - Type: DELETE
   - Pour: Authenticated users  
   - Condition: `(bucket_id = 'avatars')`
   - Cliquez "Save policy"

## 🔍 Vérification

Après configuration, testez en:
1. Accédez à votre profil (`/account`)
2. Cliquez "Télécharger une photo"
3. Sélectionnez une image JPG/PNG/WebP/GIF (max 5MB)

## 📁 Structure de stockage

Les fichiers sont stockés selon le modèle suivant:
- **Bucket:** `avatars`
- **Chemin du fichier:** `{user_id}.{extension}` (ex: `73a9f691-6c24-4175-aeab-260ab5e78f0a.jpg`)
- **URL publique:** `https://hdjztrkyelsrcrottdsc.supabase.co/storage/v1/object/public/avatars/{user_id}.{extension}`

**Important:** Ne préfixez PAS le chemin avec le nom du bucket - la méthode `supabase.storage.from('avatars')` l'ajoute automatiquement.

## 📝 Formats supportés

- JPG/JPEG
- PNG
- WebP
- GIF
- Taille maximale: 5MB

## 🐛 Dépannage

### Erreur 400 (Bad Request)
- **Cause:** Le bucket n'existe pas ou les chemins sont mal formés
- **Solution:** Vérifiez que le bucket `avatars` existe et que vous utilisez les bons chemins

### Erreur 403 (Forbidden)
- **Cause:** Les politiques RLS ne sont pas configurées correctement
- **Solution:** Vérifiez que vous avez créé les politiques dans l'onglet "Policies" du bucket

### Les images ne s'affichent pas
- **Cause:** L'URL n'est pas correcte ou le bucket n'est pas public
- **Solution:** Vérifiez que le bucket est marqué comme "Public bucket"

### Cache de l'image ancienne
- **Solution:** Les URLs incluent un timestamp (`?t=`) pour forcer le rechargement

## 🔗 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Politiques RLS dans Storage](https://supabase.com/docs/guides/storage/managing-storage-policies)
