# ✅ Guide Complet : Authentification Google Fonctionnelle

Ce guide vous aide à mettre en place l'authentification Google OAuth pour le projet "Le Règne Millénaire".

## 📋 État Actuel

✅ Code d'authentification Google : **Prêt**
- `src/integrations/google/auth.ts` - Fonctions OAuth
- `src/pages/Auth.tsx` - Bouton "Continuer avec Google"
- `src/pages/AuthCallback.tsx` - Gestion du callback

⏳ Configuration : **À faire**
- Créer un projet Google Cloud
- Générer les credentials OAuth
- Configurer Supabase

---

## 🚀 Étape 1 : Créer un Projet Google Cloud

### 1.1 Accéder à Google Cloud Console
1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Connectez-vous avec votre compte Google
3. Si vous n'avez pas de projet, cliquez sur "CREATE PROJECT"

### 1.2 Nommer le projet
- **Project name** : `Le Règne Millénaire`
- **Organization** : Facultatif
- Cliquez sur **CREATE**

### 1.3 Attendre la création
- Le projet sera créé en quelques secondes
- Une notification apparaîtra en haut à droite

---

## 🔑 Étape 2 : Activer Google+ API

### 2.1 Naviguer vers les APIs
1. Dans la console, cliquez sur **"APIs & Services"**
2. Cliquez sur **"Enable APIs and Services"**

### 2.2 Rechercher et activer Google+ API
1. Tapez `Google+ API` dans la barre de recherche
2. Cliquez sur le résultat
3. Cliquez sur **ENABLE**
4. Attendre quelques secondes

### 2.3 Vérifier
- Vous devriez voir "Google+ API" avec le statut "ENABLED"

---

## 🎫 Étape 3 : Créer les Credentials OAuth

### 3.1 Accéder aux Credentials
1. Dans "APIs & Services", cliquez sur **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"**
3. Sélectionnez **"OAuth 2.0 Client ID"**

### 3.2 Configurer l'écran de consentement (s'il y a une invite)
Si c'est la première fois, vous devez configurer l'écran de consentement OAuth :

1. Cliquez sur **"Configure Consent Screen"**
2. Choisissez **"External"** (utilisateurs externes)
3. Cliquez sur **CREATE**

**Formulaire à remplir :**
- **App name** : `Le Règne Millénaire`
- **User support email** : Votre email
- **Developer contact information** : Votre email
- Cliquez sur **SAVE AND CONTINUE**

**Scopes (laissez par défaut)**
- Cliquez simplement sur **SAVE AND CONTINUE**

**Test users (optionnel)**
- Vous pouvez ajouter votre email pour tester
- Cliquez sur **SAVE AND CONTINUE**

### 3.3 Créer l'ID Client
1. Retournez à "Credentials"
2. Cliquez sur **"+ CREATE CREDENTIALS"**
3. Sélectionnez **"OAuth 2.0 Client ID"**
4. Choisissez **"Web application"**
5. Nommez-le : `Le Règne Millénaire Web`

### 3.4 Configurer les URIs Autorisés

**JavaScript Origins (origines JavaScript autorisées)** :
```
http://localhost:5173
http://localhost:3000
https://yourdomain.com
https://le-royaume-connect.netlify.app
```

**Authorized redirect URIs** :
```
https://votre-projet-supabase.supabase.co/auth/v1/callback
```

Pour obtenir votre URL Supabase :
1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Configuration**
4. Copiez l'**URL du projet** (ressemble à `https://xxxxx.supabase.co`)

### 3.5 Copier les Credentials
1. Cliquez sur **CREATE**
2. Vous verrez une boîte avec :
   - **Client ID** : `xxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret** : `xxxxxxxxxxxx`
3. **Copiez ces deux valeurs dans un endroit sûr** ⚠️

---

## 🔧 Étape 4 : Configurer Supabase

### 4.1 Accéder au Dashboard Supabase
1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet

### 4.2 Activer Google Provider
1. Allez dans **Authentication** → **Providers**
2. Trouvez **Google** dans la liste
3. Cliquez sur la switch pour **Enable**

### 4.3 Ajouter les Credentials
1. Dans la section Google, remplissez :
   - **Client ID** : Collez votre Client ID Google
   - **Client Secret** : Collez votre Client Secret Google
2. Cliquez sur **Save**

### 4.4 Configurer les URLs de Redirection
1. Allez dans **Authentication** → **URL Configuration**
2. Sous **Redirect URLs**, assurez-vous que :
   ```
   http://localhost:5173
   http://localhost:3000
   https://yourdomain.com/auth/callback
   https://le-royaume-connect.netlify.app/auth/callback
   ```
   sont listées (ajoutez si nécessaire)
3. Cliquez sur **Save**

---

## 📱 Étape 5 : Configuration Locale (.env.local)

### 5.1 Créer le fichier .env.local
À la racine du projet, créez un fichier `.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key-ici
```

### 5.2 Obtenir vos clés Supabase
1. Allez dans **Supabase Dashboard** → **Settings** → **API**
2. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 5.3 Redémarrer le serveur
```bash
npm run dev
# ou
bun run dev
```

---

## 🌍 Étape 6 : Configuration Netlify (Production)

### 6.1 Ajouter les Variables d'Environnement
1. Allez sur [Netlify Dashboard](https://app.netlify.com)
2. Sélectionnez votre site
3. Allez dans **Site settings** → **Build & deploy** → **Environment**
4. Cliquez sur **Edit variables**
5. Ajoutez :
   - **VITE_SUPABASE_URL** : `https://votre-projet.supabase.co`
   - **VITE_SUPABASE_ANON_KEY** : `votre-anon-key`
6. Cliquez sur **Save**

### 6.2 Déclencher un Redéploiement
1. Allez dans **Deployments**
2. Cliquez sur le deploy le plus récent
3. Cliquez sur **Trigger deploy** ou faites un `git push` vers votre branche

---

## ✅ Étape 7 : Tester l'Authentification

### 7.1 Test Local
1. Ouvrez `http://localhost:5173/auth`
2. Cliquez sur **"Continuer avec Google"**
3. Vous devriez être redirigé vers Google pour autoriser
4. Après autorisation, vous devriez être redirigé vers `/feed`

### 7.2 Si ça ne marche pas
- Consultez la section **Dépannage** ci-dessous

---

## 🔍 Dépannage

### Erreur : "OAuth redirect_uri_mismatch"
**Problème** : L'URI de redirection ne correspond pas

**Solution** :
1. Vérifiez l'URL exacte dans votre navigateur
2. Assurez-vous qu'elle correspond dans Google Cloud Console
3. Vérifiez aussi dans Supabase → URL Configuration
4. N'oubliez pas le protocole (http/https)

### Erreur : "Redirect URI not whitelisted"
**Problème** : L'URI n'a pas été ajoutée aux URIs autorisées

**Solution** :
1. Allez dans Google Cloud Console → Credentials
2. Éditez l'ID Client OAuth
3. Ajoutez l'URI exact dans **Authorized redirect URIs**
4. Cliquez sur **Save**

### Ça ne marche qu'en production, pas en local
**Problème** : Localhost n'est pas configuré

**Solution** :
1. Ajoutez `http://localhost:5173` dans Google Cloud Console
2. Ajoutez `http://localhost:5173` dans Supabase → URL Configuration
3. Redémarrez le serveur dev

### Erreur : "VITE_SUPABASE_URL is not defined"
**Problème** : Les variables d'environnement ne sont pas chargées

**Solution** :
1. Créez `.env.local` à la racine du projet
2. Ajoutez vos clés Supabase
3. Redémarrez le serveur dev (`npm run dev`)

---

## 📚 Ressources Utiles

- [Documentation Supabase OAuth](https://supabase.com/docs/guides/auth/social-login)
- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [Supabase Dashboard](https://app.supabase.com)

---

## 🎯 Checklist Finale

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] Credentials OAuth générées
- [ ] Supabase configuré avec Google Provider
- [ ] Variables d'environnement locales configurées (.env.local)
- [ ] Netlify variables d'environnement configurées
- [ ] Test local successful ✅
- [ ] Test production successful ✅

---

## 💡 Conseils

1. **Gardez vos credentials sécurisés** - Ne commit pas `.env.local` dans git
2. **Utilisez le même Client ID** pour dev et production si possible, mais assurez-vous que les URIs correspondent
3. **Testez sur votre domaine production** avant de lancer - Les URLs doivent correspondre exactement
4. **Conservez une sauvegarde** de vos Client ID et Secret

---

**Besoin d'aide ?** Consultez les fichiers de documentation ou testez étape par étape.
