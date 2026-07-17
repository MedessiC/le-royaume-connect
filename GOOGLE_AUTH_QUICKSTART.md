# 🚀 Configuration Google OAuth - Guide Rapide

## Résumé des étapes

1. **Google Cloud Console**
   - Créer un projet
   - Activer Google+ API
   - Créer des credentials OAuth 2.0 (Web application)

2. **Configurer les URIs**
   - **JavaScript Origins** : `http://localhost:5173`, `https://yourdomain.com`
   - **Redirect URIs** : `https://your-supabase-project.supabase.co/auth/v1/callback`

3. **Supabase Dashboard**
   - Authentication → Providers → Google → Enable
   - Ajouter Client ID et Client Secret
   - URL Configuration → Ajouter `http://localhost:5173` et `https://yourdomain.com/auth/callback`

4. **Fichier .env.local**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Netlify (Production)**
   - Site settings → Build & deploy → Environment
   - Ajouter les mêmes variables d'environnement

6. **Tester**
   - Allez sur `http://localhost:5173/auth`
   - Cliquez sur "Continuer avec Google"
   - Vous devriez être redirigé vers `/feed` après autorisation

## Fichiers Clés

- `src/integrations/google/auth.ts` - Logique d'authentification
- `src/integrations/google/config.ts` - Configuration
- `src/pages/Auth.tsx` - Bouton Google
- `src/pages/AuthCallback.tsx` - Gestion du callback

## Dépannage

### "OAuth redirect_uri_mismatch"
- Vérifiez que l'URI correspond dans Google Cloud ET Supabase
- Assurez-vous que vous utilisez `http://localhost:5173` (pas `127.0.0.1`)

### ".env.local not loaded"
- Redémarrez le serveur dev après créer `.env.local`
- Assurez-vous que les variables commencent par `VITE_`

### Ça fonctionne en prod mais pas en local
- Ajoutez `http://localhost:5173` dans les URIs JavaScript autorisées
- Vérifiez `.env.local` existe et contient les bonnes clés

## Documentation Complète

Voir [GOOGLE_AUTH_SETUP_COMPLETE.md](./GOOGLE_AUTH_SETUP_COMPLETE.md) pour des instructions détaillées.
