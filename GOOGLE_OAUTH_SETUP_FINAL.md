# Configuration Google OAuth pour Le Règne Millénaire

Ce guide explique comment configurer l'authentification Google via Supabase.

## Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Nommez-le : "Le Règne Millénaire"

### 2. Activer les APIs nécessaires

1. Dans la console, naviguez vers "APIs & Services"
2. Cliquez sur "Enable APIs and Services"
3. Recherchez et activez :
   - **Google+ API** (pour OAuth)
   - **Google Identity Services API**

### 3. Créer les credentials OAuth

1. Allez dans "APIs & Services" → "Credentials"
2. Cliquez sur "Create Credentials" → "OAuth 2.0 Client ID"
3. Choisissez "Web application"
4. Nommez-le : "Le Règne Millénaire Web"

### 4. Configurer les URIs

**URIs JavaScript autorisés** :
- `http://localhost:5173` (développement local)
- `http://localhost:3000` (alternative dev)
- `https://yourdomain.com` (production)

**URIs de redirection autorisés** :
- `https://votre-projet-supabase.supabase.co/auth/v1/callback` (Supabase)
  
Pour trouver votre URL Supabase :
1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Dans "Settings" → "Configuration", copiez l'URL du projet

### 5. Copier les credentials

Vous obtiendrez :
- **Client ID** : xxxxxxxxxx.apps.googleusercontent.com
- **Client Secret** : xxxxxxxxxxxxxxxxxxxx

### 6. Configurer Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans "Authentication" → "Providers"
4. Trouvez "Google" et cliquez sur "Enable"
5. Remplissez les champs :
   - **Client ID** : collez votre Client ID Google
   - **Client Secret** : collez votre Client Secret Google
6. Cliquez sur "Save"

### 7. Configurer les URLs de redirection dans Supabase

1. Dans "Authentication" → "URL Configuration"
2. Assurez-vous que les URLs de redirection incluent :
   - `http://localhost:5173` (dev)
   - `https://yourdomain.com/auth/callback` (prod)

### 8. Tester l'authentification

1. Allez sur `http://localhost:5173/auth`
2. Cliquez sur "Continuer avec Google"
3. Vous devriez être redirigé vers Google pour autoriser
4. Après autorisation, vous devriez être redirigé vers `/feed`

## Dépannage

### "OAuth redirect_uri_mismatch"
- Vérifiez que l'URI dans Supabase correspond exactement à celui dans Google Cloud Console
- N'oubliez pas le protocole (http/https)

### "Redirect URI not whitelisted"
- Ajoutez l'URI exact dans les deux services :
  - Google Cloud Console → OAuth consent screen
  - Supabase → Authentication → URL Configuration

### Cela ne fonctionne pas en développement
- Utilisez `http://localhost:5173` (pas `http://127.0.0.1:5173`)
- Vérifiez que le port est correct (par défaut 5173 pour Vite)

## Fichiers clés

- `src/integrations/google/auth.ts` - Logique d'authentification
- `src/integrations/google/config.ts` - Configuration
- `src/pages/Auth.tsx` - Page de connexion
- `src/pages/AuthCallback.tsx` - Callback d'authentification

## Variables d'environnement requises

Créez un fichier `.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key
```

Ces variables sont nécessaires pour que Supabase fonctionne correctement.

## Support

Pour plus d'informations :
- [Documentation Supabase OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
