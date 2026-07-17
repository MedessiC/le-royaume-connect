# 🔧 Configuration Google OAuth - Instructions Détaillées

## Vous êtes à l'étape : Remplir le formulaire Google Cloud Console

Vous avez ouvert le formulaire "OAuth 2.0 Client ID" pour une "Application Web". Voici exactement quoi remplir :

---

## 1️⃣ **Nom** 
Ce champ est juste pour vous, les utilisateurs ne le verront pas.

**Entrez :**
```
Le Règne Millénaire - Web App
```

ou simplement :

```
Le Règne Millénaire
```

---

## 2️⃣ **Origines JavaScript autorisées**
Ce sont les URLs **d'où votre application web va faire des requêtes** OAuth.

### Pour le développement local :

Cliquez sur **"+ Add URI"** et ajoutez ces URLs une par une :

```
http://localhost:5173
http://localhost:3000
```

### Pour la production :

Cliquez sur **"+ Add URI"** et ajoutez :

```
https://le-royaume-connect.netlify.app
https://yourdomain.com
```

**Résumé - Origines JavaScript autorisées :**
```
✅ http://localhost:5173       (Développement - Vite default)
✅ http://localhost:3000       (Alternative local)
✅ https://le-royaume-connect.netlify.app  (Production)
✅ https://yourdomain.com      (Votre domaine custom)
```

---

## 3️⃣ **URI de redirection autorisés** ⚠️ **IMPORTANT**
Ce sont les URLs **OÙ Google va rediriger après l'authentification**. C'est le point critique !

### Étape 1 : Trouver votre URL Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **Configuration**
4. Copiez l'**URL du projet** (ressemble à `https://xxxxx.supabase.co`)

Appelons-le `YOUR_SUPABASE_URL` pour cet exemple.

### Étape 2 : Construire l'URI de redirection Supabase

**Formule :**
```
{YOUR_SUPABASE_URL}/auth/v1/callback
```

**Exemple réel :**
```
https://abcdef123456.supabase.co/auth/v1/callback
```

### Étape 3 : Ajouter tous les URIs

Cliquez sur **"+ Add URI"** pour chaque ligne ci-dessous :

```
https://YOUR_SUPABASE_URL/auth/v1/callback
http://localhost:5173/auth/callback
https://le-royaume-connect.netlify.app/auth/callback
https://yourdomain.com/auth/callback
```

**Résumé - URI de redirection autorisés :**
```
✅ https://abcdef123456.supabase.co/auth/v1/callback     (IMPORTANT - Supabase endpoint)
✅ http://localhost:5173/auth/callback                   (Développement)
✅ https://le-royaume-connect.netlify.app/auth/callback  (Production)
✅ https://yourdomain.com/auth/callback                  (Domaine custom)
```

---

## 📋 Checklist Avant de Cliquer "CREATE"

- [ ] **Nom** rempli (ex: "Le Règne Millénaire")
- [ ] **Origines JavaScript** ajoutées :
  - [ ] http://localhost:5173
  - [ ] http://localhost:3000
  - [ ] https://le-royaume-connect.netlify.app
  - [ ] https://yourdomain.com
- [ ] **URI de redirection** ajoutés :
  - [ ] https://YOUR_SUPABASE_URL/auth/v1/callback ⚠️
  - [ ] http://localhost:5173/auth/callback
  - [ ] https://le-royaume-connect.netlify.app/auth/callback
  - [ ] https://yourdomain.com/auth/callback

---

## ✅ Cliquez sur "CREATE"

Une fois tout rempli, cliquez sur le bouton **"CREATE"** en bas.

Vous verrez alors une boîte de dialogue avec :
- **Client ID** : `xxxxx.apps.googleusercontent.com`
- **Client Secret** : `xxxxx`

---

## 🚨 IMPORTANTE : Sauvegardez vos credentials

Une fois "CREATE" cliqué, vous verrez :

```
Client ID:     abc123xyz.apps.googleusercontent.com
Client Secret: XyZ_abc123
```

**Copiez ces deux valeurs** dans un endroit sûr (notepad, password manager, etc.)

---

## 📝 Après avoir les credentials : Prochaine étape

1. Allez sur [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **Providers**
4. Cliquez sur **Google** pour l'activer
5. Collez vos credentials :
   - **Client ID** ← Collez votre Client ID Google
   - **Client Secret** ← Collez votre Client Secret Google
6. Cliquez sur **Save**

---

## 🎯 Résumé du flux

```
1. Vous êtes ici ← Remplir le formulaire Google
                    ↓
2. Obtenir Client ID + Secret
                    ↓
3. Aller sur Supabase
                    ↓
4. Activer Google Provider + ajouter credentials
                    ↓
5. Créer .env.local avec clés Supabase
                    ↓
6. Tester sur http://localhost:5173/auth
```

---

## 💡 Astuces

- **Utilisez votre vrai domaine de production** si vous l'avez déjà
- **Localhost fonctionne uniquement en `http://`** (pas https)
- **L'URI Supabase est CRITIQUE** - c'est là que Google envoie le token
- **Attendez 5-15 minutes** après création pour que les paramètres s'appliquent

---

**Besoin d'aide ?** Posez une question après avoir créé les credentials !
